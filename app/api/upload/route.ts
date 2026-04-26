import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/avif', 'image/heic', 'image/heif',
  'image/svg+xml', 'image/bmp', 'image/tiff',
];

async function uploadToCloudinary(
  file: File,
  folder: string,
  cloudName: string,
  uploadPreset: string,
): Promise<string> {
  // Convert to base64 data URI — most reliable across all runtimes/file types
  const bytes  = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const dataURI = `data:${file.type || 'image/jpeg'};base64,${base64}`;

  const body = new URLSearchParams();
  body.append('file',           dataURI);
  body.append('upload_preset',  uploadPreset);
  body.append('folder',         folder);

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
    const msg = data?.error?.message || `Cloudinary error ${res.status}`;
    throw new Error(msg);
  }

  return data.secure_url;
}

export async function POST(req: NextRequest) {
  // ── Auth: use verifyAdminRequest which handles signed cookie correctly ──────
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }
    const isImage = ACCEPTED_MIME.includes(file.type) ||
      /\.(jpg|jpeg|png|webp|gif|avif|heic|heif|svg|bmp|tiff|ico)$/i.test(file.name);
    if (!isImage) {
      return NextResponse.json({ error: 'Please upload a valid image file.' }, { status: 400 });
    }

    const cloudName    = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

    // ── Production: Cloudinary ────────────────────────────────────────────────
    if (cloudName && uploadPreset) {
      const url = await uploadToCloudinary(file, 'cold-dog/products', cloudName, uploadPreset);
      return NextResponse.json({ url });
    }

    // ── Development: local filesystem ─────────────────────────────────────────
    if (process.env.NODE_ENV === 'development') {
      const { writeFile, mkdir } = await import('fs/promises');
      const path = await import('path');
      const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const dir      = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ url: `/uploads/${filename}` });
    }

    // ── Not configured ─────────────────────────────────────────────────────────
    return NextResponse.json({
      error: 'Image uploads require Cloudinary. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to Vercel Environment Variables.',
    }, { status: 501 });

  } catch (err: any) {
    console.error('[upload] error:', err.message);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
