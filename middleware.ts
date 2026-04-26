import { NextRequest, NextResponse } from 'next/server';

// ── Fast in-memory rate limiter for edge (Upstash called from API routes) ────
// Middleware runs on the Edge runtime — can't use Node.js modules
// Upstash is called from individual API routes via lib/rateLimit.ts
// This middleware handles the security headers + basic admin protection
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 10000) rateLimitMap.clear(); // memory safety
  const e = rateLimitMap.get(key);
  if (!e || now > e.resetAt) { rateLimitMap.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (e.count >= max) return false;
  e.count++;
  return true;
}

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);
  const res = NextResponse.next();

  // Web Crypto verification for Edge runtime
  async function verifyAdminSessionEdge(cookieValue: string | undefined): Promise<boolean> {
    if (!cookieValue) return false;
    const parts = cookieValue.split('.');
    if (parts.length !== 2 || parts[0] !== 'authenticated') return false;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-change-in-prod-32ch';
    try {
      const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
      );
      const hex = parts[1];
      const signatureBuffer = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      return await crypto.subtle.verify('HMAC', key, signatureBuffer, new TextEncoder().encode(parts[0]));
    } catch {
      return false;
    }
  }

  // ── Security headers ──────────────────────────────────────────────────────
  res.headers.set('X-Content-Type-Options',  'nosniff');
  res.headers.set('X-Frame-Options',         'DENY');
  res.headers.set('X-XSS-Protection',        '1; mode=block');
  res.headers.set('Referrer-Policy',         'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy',      'camera=(), microphone=(), geolocation=()');
  res.headers.set('Strict-Transport-Security','max-age=63072000; includeSubDomains; preload');
  res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.razorpay.com https://api.cloudinary.com https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://*.upstash.io",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));

  // ── Rate limits (edge, per-instance) ─────────────────────────────────────
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    if (!rateLimit(`al:${ip}`, 5, 15 * 60 * 1000))
      return NextResponse.json({ error: 'Too many attempts. Wait 15 minutes.' }, { status: 429, headers: { 'Retry-After': '900' } });
  }

  if (pathname === '/api/auth/user/send-otp' && req.method === 'POST') {
    if (!rateLimit(`otp:${ip}`, 3, 5 * 60 * 1000))
      return NextResponse.json({ error: 'Too many OTP requests. Wait 5 minutes.' }, { status: 429 });
  }

  if (pathname === '/api/auth/user/verify-otp' && req.method === 'POST') {
    if (!rateLimit(`vf:${ip}`, 10, 10 * 60 * 1000))
      return NextResponse.json({ error: 'Too many verification attempts.' }, { status: 429 });
  }

  if (pathname === '/api/razorpay/create-order' && req.method === 'POST') {
    if (!rateLimit(`rz:${ip}`, 20, 60 * 60 * 1000))
      return NextResponse.json({ error: 'Too many payment requests.' }, { status: 429 });
  }

  if (pathname.startsWith('/api/')) {
    if (!rateLimit(`api:${ip}`, 120, 60 * 1000))
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  // ── Block admin APIs without valid session ────────────────────────────────
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    const session = req.cookies.get('admin_session')?.value;
    if (!(await verifyAdminSessionEdge(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ── Block admin pages without valid session ───────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    const session = req.cookies.get('admin_session')?.value;
    if (!(await verifyAdminSessionEdge(session))) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
};
