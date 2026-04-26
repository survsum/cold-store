/**
 * Distributed rate limiting via Upstash Redis.
 * Falls back to in-memory when Upstash env vars are not set (local dev).
 *
 * Setup (free at upstash.com):
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=your_token
 */

// ── Lazy singletons ──────────────────────────────────────────────────────────
let _redis: any    = null;
let _Ratelimit: any = null;
let _initialized    = false;

async function initUpstash(): Promise<{ redis: any; Ratelimit: any } | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (_initialized) return _redis ? { redis: _redis, Ratelimit: _Ratelimit } : null;
  _initialized = true;

  try {
    const { Redis }       = await import('@upstash/redis');
    const { Ratelimit }   = await import('@upstash/ratelimit');
    _redis     = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    _Ratelimit = Ratelimit;
    return { redis: _redis, Ratelimit: _Ratelimit };
  } catch (e) {
    console.error('[rateLimit] Upstash init failed:', e);
    return null;
  }
}

// ── In-memory fallback ───────────────────────────────────────────────────────
const _mem = new Map<string, { count: number; resetAt: number }>();

function memLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (_mem.size > 20000) _mem.clear(); // prevent memory leak
  const e = _mem.get(key);
  if (!e || now > e.resetAt) {
    _mem.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (e.count >= max) return false;
  e.count++;
  return true;
}

// ── Public API ───────────────────────────────────────────────────────────────
export interface RateLimitConfig {
  key:      string;   // unique key e.g. "admin-login:1.2.3.4"
  max:      number;   // max requests allowed
  windowMs: number;   // rolling window in milliseconds
}

export async function checkRateLimit({ key, max, windowMs }: RateLimitConfig): Promise<boolean> {
  try {
    const upstash = await initUpstash();

    if (!upstash) {
      // No Upstash configured → use in-memory (per-instance, ok for dev)
      return memLimit(key, max, windowMs);
    }

    const { redis, Ratelimit } = upstash;
    const windowSec = Math.max(1, Math.round(windowMs / 1000));

    const limiter = new Ratelimit({
      redis,
      limiter:  Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix:   '@colddog/rl',
      ephemeralCache: new Map(), // local cache reduces Redis calls
    });

    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    // Never crash a request because of a rate limit error — fail open
    console.error('[rateLimit] error:', err);
    return true;
  }
}

/**
 * Helper: get client IP from request headers
 */
export function getClientIP(req: Request | { headers: { get(k: string): string | null } }): string {
  return (
    (req.headers as any).get?.('x-forwarded-for')?.split(',')[0]?.trim() ||
    (req.headers as any).get?.('x-real-ip') ||
    'unknown'
  );
}
