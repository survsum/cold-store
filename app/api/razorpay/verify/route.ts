import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/userAuth';

const MAX_NAME  = 200;
const MAX_EMAIL = 254;
const MAX_ADDR  = 500;
const MAX_ITEMS = 50;

function sanitizeString(s: unknown, maxLen: number): string {
  if (typeof s !== 'string') return '';
  return s.replace(/\0/g, '').trim().slice(0, maxLen);
}

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Both strings are hex — same byte length, safe to compare
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected,  'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    // Signature was wrong length or not valid hex
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature,
            customerName, email, address, items, total } = body;

    // ── 1. Field presence + type validation ──────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature ||
        typeof razorpay_order_id  !== 'string' ||
        typeof razorpay_payment_id !== 'string' ||
        typeof razorpay_signature  !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid payment fields' }, { status: 400 });
    }

    // ── 2. HMAC signature verification ───────────────────────────────────────
    const sigValid = verifyRazorpaySignature(
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    );
    if (!sigValid) {
      console.warn(`[SECURITY] Bad Razorpay sig — order=${razorpay_order_id} pay=${razorpay_payment_id}`);
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // ── 3. Idempotency — prevent duplicate orders from double-submit ─────────
    const existing = await prisma.order.findUnique({
      where: { paymentId: razorpay_payment_id },
      select: { id: true },
    });
    if (existing) {
      // Already processed — return success so client doesn't retry
      return NextResponse.json({ success: true, orderId: existing.id, paymentId: razorpay_payment_id, duplicate: true });
    }

    // ── 4. Sanitize customer data ────────────────────────────────────────────
    const safeName    = sanitizeString(customerName, MAX_NAME);
    const safeEmail   = sanitizeString(email, MAX_EMAIL);
    const safeAddress = sanitizeString(address, MAX_ADDR);

    if (!safeName || !safeEmail || !safeAddress) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    // ── 5. Server-side price recalculation ───────────────────────────────────
    const products   = await prisma.product.findMany({
      where: { id: { in: items.map((i: any) => String(i.id)) } },
      select: { id: true, price: true, name: true },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    let serverSubtotal = 0;
    const safeItems: any[] = [];

    for (const item of items) {
      const product = productMap.get(String(item.id));
      if (!product) continue;
      const qty = Math.max(1, Math.min(100, parseInt(item.quantity) || 1));
      serverSubtotal += product.price * qty;
      safeItems.push({
        id: product.id, name: product.name,
        price: product.price, quantity: qty,
        image: typeof item.image === 'string' ? item.image.slice(0, 500) : '',
      });
    }

    const shipping   = serverSubtotal >= 999 ? 0 : 99;
    const tax        = serverSubtotal * 0.18;
    const grandTotal = serverSubtotal + shipping + tax;

    const clientTotal = parseFloat(total) || 0;
    if (Math.abs(clientTotal - grandTotal) > 2) {
      console.warn(`[SECURITY] Price mismatch client=${clientTotal} server=${grandTotal} pay=${razorpay_payment_id}`);
    }

    // ── 6. Persist order ─────────────────────────────────────────────────────
    const userPayload = await getUserFromRequest(req);
    const order = await prisma.order.create({
      data: {
        customerName: safeName,
        email:        safeEmail,
        address:      safeAddress,
        items:        JSON.stringify(safeItems),
        total:        grandTotal,
        status:       'paid',
        paymentId:    razorpay_payment_id,   // stored for dedup
        userId:       userPayload?.id || null,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id, paymentId: razorpay_payment_id });

  } catch (error: any) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
