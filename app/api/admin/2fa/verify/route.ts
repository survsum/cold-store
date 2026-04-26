import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionValue } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  // Must have 2fa_pending cookie to reach this route
  const pending = req.cookies.get('admin_2fa_pending')?.value;
  if (pending !== 'true') {
    return NextResponse.json({ error: 'No pending 2FA session' }, { status: 400 });
  }

  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string' || token.length !== 6) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const totpSecret = process.env.ADMIN_TOTP_SECRET;
    if (!totpSecret) {
      return NextResponse.json({ error: '2FA not configured' }, { status: 500 });
    }

    const { authenticator } = await import('otplib');
    authenticator.options = { window: 1 };
    const isValid = authenticator.check(token, totpSecret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
    }

    // Upgrade from pending → full session
    const sessionValue = createAdminSessionValue();
    const res = NextResponse.json({ success: true });

    res.cookies.set('admin_session', sessionValue, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24,
      path:     '/',
    });

    // Clear the pending cookie
    res.cookies.set('admin_2fa_pending', '', { maxAge: 0, path: '/' });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
