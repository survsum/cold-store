import crypto from 'crypto';

// Simple RFC 6238 TOTP implementation (no external dep needed)
// Compatible with Google Authenticator, Authy, 1Password

function base32Decode(s: string): Buffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0;
  const output: number[] = [];
  const input = s.toUpperCase().replace(/=+$/, '');
  for (const c of input) {
    const idx = chars.indexOf(c);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bits -= 8; output.push((value >> bits) & 0xff); }
  }
  return Buffer.from(output);
}

function base32Encode(buf: Buffer): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { bits -= 5; out += chars[(value >> bits) & 31]; }
  }
  if (bits > 0) out += chars[(value << (5 - bits)) & 31];
  return out;
}

export function generateSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

function getHOTP(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24)
    | (hmac[offset+1] << 16) | (hmac[offset+2] << 8) | hmac[offset+3];
  return String(code % 1000000).padStart(6, '0');
}

export function getTOTP(secret: string, window = 0): string {
  const counter = Math.floor(Date.now() / 1000 / 30) + window;
  return getHOTP(secret, counter);
}

export function verifyTOTP(secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  // Allow ±1 window (30s before/after)
  for (const w of [-1, 0, 1]) {
    if (getTOTP(secret, w) === token) return true;
  }
  return false;
}

export function getTOTPUri(secret: string, label = 'ColdDog Admin'): string {
  return `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=ColdDog&algorithm=SHA1&digits=6&period=30`;
}

export function getQRCodeUrl(secret: string): string {
  const uri = getTOTPUri(secret);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
}
