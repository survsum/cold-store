/**
 * GET /api/admin/debug-cloudinary
 * Quick diagnostic — call this in browser while logged in as admin
 * to verify Cloudinary env vars are set correctly on Vercel.
 * Remove this file after confirming uploads work.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cloudName    = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || '';

  const checks = {
    CLOUDINARY_CLOUD_NAME:    { set: !!cloudName,    value: cloudName    ? `${cloudName.slice(0,4)}…`    : 'MISSING' },
    CLOUDINARY_UPLOAD_PRESET: { set: !!uploadPreset, value: uploadPreset ? `${uploadPreset.slice(0,4)}…` : 'MISSING' },
  };

  const allSet = Object.values(checks).every(c => c.set);

  // If both are set, do a live test ping to Cloudinary
  let cloudinaryReachable = false;
  let testError = '';
  if (allSet) {
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          // send an intentionally tiny/invalid upload just to check the endpoint responds
          file: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
          upload_preset: uploadPreset,
          folder: 'colddog-test',
        }).toString(),
      });
      const data = await res.json();
      // A successful upload or a known Cloudinary error (not a network error) means we can reach it
      cloudinaryReachable = true;
      if (!res.ok) testError = data?.error?.message || `HTTP ${res.status}`;
    } catch (e: any) {
      testError = e.message;
    }
  }

  return NextResponse.json({
    status: allSet ? (testError ? 'env_set_but_upload_failed' : 'ok') : 'missing_env_vars',
    checks,
    cloudinaryReachable,
    testError: testError || null,
    instructions: allSet
      ? testError
        ? `Cloudinary is reachable but rejected the upload: "${testError}". Check that your upload preset is set to UNSIGNED in Cloudinary dashboard.`
        : 'Everything looks good! Cloudinary is configured and reachable.'
      : 'Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in Vercel → Project → Settings → Environment Variables, then redeploy.',
  });
}
