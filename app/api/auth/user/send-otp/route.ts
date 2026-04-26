import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mailer';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Distributed rate limit: 3 OTP requests per 5 min per IP
  const ipOk = await checkRateLimit({ key: `send-otp:ip:${ip}`, max: 3, windowMs: 5 * 60 * 1000 });
  if (!ipOk) {
    return NextResponse.json({ error: 'Too many OTP requests. Wait 5 minutes.' }, { status: 429 });
  }

  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim().slice(0, 254);

    // Also rate limit per email address (prevents targeting specific accounts)
    const emailOk = await checkRateLimit({ key: `send-otp:email:${normalizedEmail}`, max: 3, windowMs: 10 * 60 * 1000 });
    if (!emailOk) {
      return NextResponse.json({ error: 'Too many OTP requests for this email. Wait 10 minutes.' }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const { code } = await createOTP(normalizedEmail, 'login');
    await sendOTPEmail(normalizedEmail, code, user?.name || undefined);
    return NextResponse.json({ success: true, isNew: !user });
  } catch (err: any) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
