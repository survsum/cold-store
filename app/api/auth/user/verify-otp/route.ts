import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOTP } from '@/lib/otp';
import { signUserToken, createSessionCookie } from '@/lib/userAuth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Distributed rate limit: 10 verify attempts per 10 min per IP (brute force guard)
  const allowed = await checkRateLimit({ key: `verify-otp:${ip}`, max: 10, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many verification attempts. Wait 10 minutes.' }, { status: 429 });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim().slice(0, 254);
    const valid = await verifyOTP(normalizedEmail, code, 'login');

    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: normalizedEmail, provider: 'email' },
      });
    }

    const token = await signUserToken({
      id:       user.id,
      email:    user.email,
      name:     user.name,
      avatar:   user.avatar,
      provider: user.provider,
    });

    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, provider: user.provider } });
    res.cookies.set(createSessionCookie(token));
    return res;
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
