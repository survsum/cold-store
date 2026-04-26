import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Sign the admin session cookie so it can't be forged
// Cookie value = "authenticated.<HMAC>" — server verifies the HMAC
function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'fallback-secret-change-in-prod-32ch';
}

function signToken(value: string): string {
  const hmac = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  return `${value}.${hmac}`;
}

function verifyToken(signed: string): boolean {
  const parts = signed.split('.');
  if (parts.length !== 2) return false;
  const [value, sig] = parts;
  const expected = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function createAdminSessionValue(): string {
  return signToken('authenticated');
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const val   = store.get('admin_session')?.value;
    if (!val) return false;
    return verifyToken(val);
  } catch {
    return false;
  }
}

export function isAdminAuthenticatedFromRequest(req: NextRequest): boolean {
  const val = req.cookies.get('admin_session')?.value;
  if (!val) return false;
  // Simple check for middleware (fast path)
  // Full verification in API routes
  return val.startsWith('authenticated.');
}

export function verifyAdminRequest(req: NextRequest): boolean {
  const val = req.cookies.get('admin_session')?.value;
  if (!val) return false;
  return verifyToken(val);
}
