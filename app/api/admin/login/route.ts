import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionValue } from '@/lib/adminAuth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Distributed rate limit — blocks across ALL Vercel instances
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const allowed = await checkRateLimit({ key: `admin-login:${ip}`, max: 5, windowMs: 15 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Wait 15 minutes.' },
      { status: 429, headers: { 'Retry-After': '900' } }
    );
  }

  try {
    const body     = await req.json();
    const email    = (body.email    || '').toLowerCase().trim();
    const password =  body.password || '';

    const validEmail    = (process.env.ADMIN_EMAIL    || '').toLowerCase().trim();
    const validPassword =  process.env.ADMIN_PASSWORD || '';

    if (!validEmail || !validPassword) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 });
    }

    if (email !== validEmail || password !== validPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // If TOTP secret is configured → require 2FA step
    const totpSecret = process.env.ADMIN_TOTP_SECRET;
    if (totpSecret) {
      const res = NextResponse.json({ success: true, requires2FA: true });
      res.cookies.set('admin_2fa_pending', 'true', {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 5, // 5 minutes to complete 2FA
        path:     '/',
      });
      return res;
    }

    // No 2FA — issue full session
    const sessionValue = createAdminSessionValue();
    const res = NextResponse.json({ success: true, requires2FA: false });
    res.cookies.set('admin_session', sessionValue, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24,
      path:     '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
