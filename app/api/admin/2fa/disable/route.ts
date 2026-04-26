import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

// Disabling 2FA is done by removing ADMIN_TOTP_SECRET from env vars.
// This route gives the admin clear instructions to do that.
export async function POST(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require a valid TOTP code to disable 2FA (prevents accidental/malicious disable)
  try {
    const { token } = await req.json();
    const totpSecret = process.env.ADMIN_TOTP_SECRET;

    if (!totpSecret) {
      return NextResponse.json({ error: '2FA is not currently enabled' }, { status: 400 });
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Current TOTP code required to disable 2FA' }, { status: 400 });
    }

    const { authenticator } = await import('otplib');
    authenticator.options = { window: 1 };
    const isValid = authenticator.check(token, totpSecret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code — cannot disable 2FA' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'To fully disable 2FA, remove ADMIN_TOTP_SECRET from your Vercel environment variables and redeploy.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
