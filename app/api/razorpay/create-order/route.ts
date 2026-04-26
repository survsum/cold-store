import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const MIN_ORDER    = 1;      // ₹1 minimum
const MAX_ORDER    = 500000; // ₹5 lakh maximum

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const allowed = await checkRateLimit({ key: `razorpay:${ip}`, max: 20, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many payment requests. Wait 1 hour.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { items, currency = 'INR' } = body;

    // ── CRITICAL: Never trust client-sent price ──────────────────────────────
    // Always recalculate from database prices
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    if (items.length > 50) {
      return NextResponse.json({ error: 'Too many items' }, { status: 400 });
    }

    // Validate each item ID is a non-empty string (prevent injection)
    for (const item of items) {
      if (!item.id || typeof item.id !== 'string' || item.id.length > 50) {
        return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
    }

    // Fetch real prices from database
    const productIds = items.map((i: any) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true, name: true },
    });

    // Verify all products exist
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
    }

    // Check stock and calculate server-side total
    const productMap = new Map<string, { id: string; price: number; stock: number; name: string }>(
      products.map((p: any) => [p.id, p])
    );
    let serverTotal = 0;

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({
          error: `"${product.name}" only has ${product.stock} in stock`
        }, { status: 400 });
      }
      serverTotal += product.price * item.quantity;
    }

    // Add shipping (same logic as frontend)
    const shipping    = serverTotal >= 999 ? 0 : 99;
    const tax         = serverTotal * 0.18;
    const grandTotal  = serverTotal + shipping + tax;

    // Sanity bounds
    if (grandTotal < MIN_ORDER || grandTotal > MAX_ORDER) {
      return NextResponse.json({ error: 'Order total out of allowed range' }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(grandTotal * 100), // paise — server calculated
      currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { item_count: items.length.toString() },
    });

    // Return the server-calculated amount alongside the order
    // Frontend uses this to display — it cannot override it
    return NextResponse.json({
      ...order,
      server_total: grandTotal, // what we calculated — for display only
    });

  } catch (error: any) {
    console.error('Razorpay order error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while creating payment order.' },
      { status: 500 }
    );
  }
}
