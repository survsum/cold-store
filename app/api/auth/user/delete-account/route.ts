/**
 * GDPR / Data Deletion Endpoint
 * ───────────────────────────────────────────────────────────────────────────
 * DELETE /api/auth/user/delete-account
 *
 * What this does:
 *   1. Verifies the user is authenticated
 *   2. Anonymises all orders (replaces PII with [deleted]) — keeps order
 *      records for financial/accounting audit trail as permitted by GDPR
 *      Art.17(3)(b) - legal obligation to retain financial records
 *   3. Hard-deletes: User row, OTP records, session (cookie cleared)
 *   4. Returns confirmation
 *
 * The user must confirm by passing { confirm: true } in the request body
 * to prevent accidental deletion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, clearSessionCookie } from '@/lib/userAuth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  // ── 1. Auth check ─────────────────────────────────────────────────────────
  const userPayload = await getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // ── 2. Require explicit confirmation in body ──────────────────────────────
  let body: any = {};
  try { body = await req.json(); } catch {}

  if (body.confirm !== true) {
    return NextResponse.json({
      error: 'Send { "confirm": true } to confirm account deletion',
    }, { status: 400 });
  }

  const userId = userPayload.id;

  try {
    // ── 3. Anonymise orders (keep for accounting, remove PII) ────────────────
    // GDPR Art.17(3)(b) allows retaining records for legal/financial obligations.
    // We replace identifying info with a placeholder but keep the order totals.
    await prisma.order.updateMany({
      where: { userId },
      data: {
        customerName: '[deleted]',
        email:        '[deleted]',
        address:      '[deleted]',
        // items JSON may contain names — clear it
        items:        JSON.stringify([{ name: '[deleted]', price: 0, quantity: 0 }]),
        userId:       null, // unlink from user
      },
    });

    // ── 4. Delete OTP records ─────────────────────────────────────────────────
    await prisma.oTP.deleteMany({ where: { userId } });

    // Also delete OTPs keyed by email
    await prisma.oTP.deleteMany({ where: { email: userPayload.email } });

    // ── 5. Hard-delete the user ───────────────────────────────────────────────
    await prisma.user.delete({ where: { id: userId } });

    // ── 6. Clear the session cookie ───────────────────────────────────────────
    const res = NextResponse.json({
      success: true,
      message: 'Your account and personal data have been deleted.',
    });
    res.cookies.set(clearSessionCookie());
    return res;

  } catch (err: any) {
    console.error('[delete-account] Error:', err);
    return NextResponse.json({ error: 'Deletion failed. Please try again or contact support.' }, { status: 500 });
  }
}

// GET — let the user see what data will be deleted before confirming
export async function GET(req: NextRequest) {
  const userPayload = await getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const [user, orderCount, otpCount] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userPayload.id },
        select: { id: true, email: true, name: true, provider: true, createdAt: true },
      }),
      prisma.order.count({ where: { userId: userPayload.id } }),
      prisma.oTP.count({ where: { userId: userPayload.id } }),
    ]);

    return NextResponse.json({
      data_held: {
        account:      { email: user?.email, name: user?.name, provider: user?.provider, joined: user?.createdAt },
        orders:       { count: orderCount, note: 'Order records will be anonymised (totals kept for accounting)' },
        otp_records:  { count: otpCount,   note: 'Will be permanently deleted' },
      },
      warning: 'This action is irreversible. Send DELETE with { "confirm": true } to proceed.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch data summary' }, { status: 500 });
  }
}
