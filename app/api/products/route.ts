import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeStr, stripHtml, validateProductInput } from '@/lib/validate';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Sanitize query params
    const rawCategory = searchParams.get('category');
    const category = rawCategory ? sanitizeStr(rawCategory, 100) : null;

    const where = category ? { category } : {};
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // Don't expose internal fields
      select: { id:true, name:true, description:true, price:true, image:true, category:true, stock:true, createdAt:true },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Admin session expired. Please log in again.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const validation = validateProductInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name:        sanitizeStr(body.name, 200),
        description: stripHtml(sanitizeStr(body.description || '', 2000)),
        price:       parseFloat(body.price),
        image:       sanitizeStr(body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 500),
        category:    sanitizeStr(body.category, 100),
        stock:       Math.max(0, parseInt(body.stock) || 0),
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
