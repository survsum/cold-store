# Cold Dog — Security Implementation

## What's Protected

### Authentication
- Admin login: env-var credentials, signed HMAC cookie, 5 req / 15 min distributed rate limit
- Admin 2FA: TOTP via otplib, setup at /admin/setup-2fa, env var ADMIN_TOTP_SECRET
- User auth: JWT (HS256, 30-day expiry), httpOnly secure cookie
- OTP: 6-digit, 5-min expiry, single-use, rate limited by IP + by email

### Rate Limiting — Distributed via Upstash Redis
| Endpoint | Limit | Window |
|----------|-------|--------|
| Admin login | 5 req | 15 min / IP |
| Send OTP (IP) | 3 req | 5 min / IP |
| Send OTP (email) | 3 req | 10 min / email |
| Verify OTP | 10 req | 10 min / IP |
| Razorpay create-order | 20 req | 1 hour / IP |
| All API routes | 120 req | 1 min / IP |

Falls back to per-instance in-memory if Upstash is not configured.

### Payment Security
- Price recalculated server-side from DB on BOTH /verify and /webhook
- HMAC-SHA256 Razorpay signature verified with crypto.timingSafeEqual
- paymentId stored as UNIQUE on Order — prevents duplicate order creation
- WebhookEvent table records every webhook for idempotency
- Server-to-server webhook at /api/razorpay/webhook as fallback for failed client callbacks

### GDPR / Data Protection
- DELETE /api/auth/user/delete-account — hard-deletes user + OTPs
- Orders anonymised (PII replaced with [deleted]) — totals kept for accounting
- GET /api/auth/user/delete-account — shows user what data is held before deletion
- Delete Account UI in /profile page with two-step confirmation

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: max-age=63072000
- Content-Security-Policy: per-route whitelist
- Referrer-Policy: strict-origin-when-cross-origin

## Required Environment Variables
ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET
ADMIN_TOTP_SECRET (optional — enables 2FA)
USER_JWT_SECRET
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET (set in Razorpay Dashboard → Webhooks)
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (optional — distributed rate limiting)
CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET

## Razorpay Webhook Setup
1. Razorpay Dashboard → Settings → Webhooks → Add Webhook
2. URL: https://your-domain.vercel.app/api/razorpay/webhook
3. Secret: generate a random string, paste into webhook form
4. Add that same string as RAZORPAY_WEBHOOK_SECRET in Vercel env vars
5. Events to enable: payment.captured, payment.failed, order.paid
