import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { authenticator } = await import('otplib');
    const QRCode             = await import('qrcode');

    const secret    = authenticator.generateSecret(32);
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@colddog.in';
    const otpauth   = authenticator.keyuri(adminEmail, 'Cold Dog Admin', secret);
    const qrCode    = await QRCode.toDataURL(otpauth);

    return NextResponse.json({ secret, qrCode, otpauth });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
