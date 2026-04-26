import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userAuth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const userPayload = await getUserFromRequest(req);
  if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, phone } = await req.json();
    const updated = await prisma.user.update({
      where: { id: userPayload.id },
      data: {
        ...(name  ? { name:  name.trim()  } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
      },
      select: { id:true, email:true, name:true, avatar:true, provider:true },
    });
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
