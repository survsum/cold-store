import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userAuth';
import { prisma } from '@/lib/prisma';

async function uploadToCloudinary(
  file: File,
  folder: string,
  cloudName: string,
  uploadPreset: string,
): Promise<string> {
  const bytes  = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const dataURI = `data:${file.type || 'image/jpeg'};base64,${base64}`;

  const body = new URLSearchParams();
  body.append('file',          dataURI);
  body.append('upload_preset', uploadPreset);
  body.append('folder',        folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    }
  );

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch {
    throw new Error(`Cloudinary returned non-JSON: ${text.slice(0, 200)}`);
  }

  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || `Cloudinary error ${res.status}`);
  }

  return data.secure_url;
}

export async function POST(req: NextRequest) {
  const userPayload = await getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB for avatar' }, { status: 400 });

    const cloudName    = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

    let url = '';

    if (cloudName && uploadPreset) {
      url = await uploadToCloudinary(file, 'cold-dog/avatars', cloudName, uploadPreset);
    } else if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises');
      const path = await import('path');
      const ext  = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const name = `avatar_${userPayload.id}_${Date.now()}.${ext}`;
      const dir  = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
      url = `/uploads/${name}`;
    } else {
      return NextResponse.json({
        error: 'Avatar uploads require Cloudinary. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to Vercel Environment Variables.',
      }, { status: 501 });
    }

    await prisma.user.update({ where: { id: userPayload.id }, data: { avatar: url } });
    return NextResponse.json({ success: true, url });

  } catch (err: any) {
    console.error('[upload-avatar] error:', err.message);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
