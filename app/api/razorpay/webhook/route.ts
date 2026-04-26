/**
 * Razorpay Server-to-Server Webhook
 * ───────────────────────────────────────────────────────────────────────────
 * This is the BACKUP payment confirmation path.
 *
 * Flow:
 *   1. Customer pays → Razorpay sends POST to this URL directly from their servers
 *   2. We verify the webhook signature using RAZORPAY_WEBHOOK_SECRET
 *   3. If payment.captured and no order exists yet → create the order
 *   4. If order already exists (client-side verify ran first) → skip, return 200
 *
 * Setup in Razorpay Dashboard:
 *   Settings → Webhooks → Add Webhook
 *   URL: https://your-domain.vercel.app/api/razorpay/webhook
 *   Secret: set RAZORPAY_WEBHOOK_SECRET env var to the same value
 *   Events: payment.captured, payment.failed, order.paid
 *
 * IMPORTANT: This route must NOT require auth — Razorpay calls it directly.
 * Security is provided entirely by the HMAC signature check.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Razorpay retries webhooks for up to 24h — we must be idempotent
// All responses except 5xx cause Razorpay to stop retrying

function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not set');
    return false;
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected,  'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Read raw body (must be raw string for HMAC) ───────────────────────
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: 'Cannot read body' }, { status: 400 });
  }

  // ── 2. Verify webhook signature ──────────────────────────────────────────
  const signature = req.headers.get('x-razorpay-signature') || '';
  if (!signature) {
    console.warn('[webhook] Missing x-razorpay-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[webhook] Invalid webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── 3. Parse event ────────────────────────────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType   = event?.event;          // e.g. "payment.captured"
  const paymentData = event?.payload?.payment?.entity;
  const orderData   = event?.payload?.order?.entity;

  console.log(`[webhook] event=${eventType} payment=${paymentData?.id}`);

  // ── 4. Idempotency — record this webhook event ────────────────────────────
  // Use payment_id as the idempotency key
  const paymentId = paymentData?.id;
  if (!paymentId) {
    // Not a payment event — acknowledge and skip
    return NextResponse.json({ received: true });
  }

  // Check if already processed
  const alreadyProcessed = await prisma.webhookEvent.findUnique({
    where: { id: paymentId },
  });
  if (alreadyProcessed) {
    console.log(`[webhook] Already processed paymentId=${paymentId}, skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Record the webhook event immediately (before processing)
  // This prevents race conditions if Razorpay sends duplicate events
  await prisma.webhookEvent.create({
    data: {
      id:      paymentId,
      event:   eventType,
      payload: rawBody.slice(0, 10000), // cap stored size
    },
  });

  // ── 5. Handle each event type ─────────────────────────────────────────────
  try {
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      await handlePaymentCaptured(paymentData, orderData, paymentId);
    } else if (eventType === 'payment.failed') {
      await handlePaymentFailed(paymentData);
    }
    // Other events: just acknowledge
    return NextResponse.json({ received: true });

  } catch (err: any) {
    console.error('[webhook] Processing error:', err);
    // Return 500 so Razorpay retries
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// ── payment.captured handler ─────────────────────────────────────────────────
async function handlePaymentCaptured(
  payment: any,
  order: any,
  paymentId: string
) {
  // Check if client-side /api/razorpay/verify already created an order
  const existingOrder = await prisma.order.findUnique({
    where: { paymentId },
    select: { id: true, status: true },
  });

  if (existingOrder) {
    console.log(`[webhook] Order already exists for paymentId=${paymentId} orderId=${existingOrder.id}`);

    // Update webhook record with the order ID
    await prisma.webhookEvent.update({
      where: { id: paymentId },
      data:  { orderId: existingOrder.id },
    });
    return;
  }

  // Client-side verify never ran (user closed browser, connection dropped, etc.)
  // Create the order from webhook data as fallback
  console.log(`[webhook] Creating fallback order for paymentId=${paymentId}`);

  // Extract data from Razorpay payment object
  const notes        = payment?.notes || {};
  const customerName = notes.customer_name || payment?.contact || 'Customer';
  const email        = payment?.email       || notes.email      || 'unknown@unknown.com';
  const address      = notes.address        || 'Address not provided';
  const totalPaise   = payment?.amount      || 0;
  const totalINR     = totalPaise / 100;

  // We don't have full item details in the webhook — store a summary
  const fallbackItems = JSON.stringify([{
    id:       'webhook-fallback',
    name:     `Order via webhook (₹${totalINR})`,
    price:    totalINR,
    quantity: 1,
    image:    '',
  }]);

  const newOrder = await prisma.order.create({
    data: {
      customerName: String(customerName).slice(0, 200),
      email:        String(email).slice(0, 254),
      address:      String(address).slice(0, 500),
      items:        fallbackItems,
      total:        totalINR,
      status:       'paid',
      paymentId,
    },
  });

  // Update webhook record with new order ID
  await prisma.webhookEvent.update({
    where: { id: paymentId },
    data:  { orderId: newOrder.id },
  });

  console.log(`[webhook] Fallback order created orderId=${newOrder.id} total=₹${totalINR}`);
}

// ── payment.failed handler ────────────────────────────────────────────────────
async function handlePaymentFailed(payment: any) {
  const orderId = payment?.order_id;
  if (!orderId) return;

  // Log the failure — useful for debugging payment issues
  console.warn(`[webhook] Payment failed razorpay_order_id=${orderId} error=${payment?.error_description}`);

  // If there's somehow a pending order with this Razorpay order ID,
  // you could cancel it here. For now just log.
}
