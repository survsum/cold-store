import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { token, secret } = await req.json();
    if (!token || !secret) {
      return NextResponse.json({ error: 'Token and secret required' }, { status: 400 });
    }

    const { authenticator } = await import('otplib');
    authenticator.options = { window: 1 }; // allow 30s clock skew
    const isValid = authenticator.check(String(token), String(secret));

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code. Make sure your device clock is correct.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Add ADMIN_TOTP_SECRET=${secret} to your Vercel environment variables and redeploy.`,
      secret,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
