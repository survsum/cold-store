import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/userAuth';
import { prisma } from '@/lib/prisma';

async function uploadToCloudinary(
  file: File,
  folder: string,
  cloudName: string,
  uploadPreset: string,
): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const rawName = file.name.replace(/\.[^/.]+$/, "");
  
  const sanitized = rawName
    .replace(/[/\\]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
    
  const safeName = `${sanitized || 'avatar'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const formData = new FormData();
  formData.append('file', file, `${safeName}.${ext}`);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('public_id', safeName);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method:  'POST',
      body:    formData,
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
