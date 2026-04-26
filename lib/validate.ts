// Shared input validation utilities

export function sanitizeStr(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  // Remove null bytes and control characters
  return val.replace(/\0/g, '').trim().slice(0, maxLen);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email);
}

export function isValidPrice(price: unknown): boolean {
  const n = typeof price === 'number' ? price : parseFloat(String(price));
  return !isNaN(n) && n > 0 && n < 10000000 && isFinite(n);
}

export function isValidStock(stock: unknown): boolean {
  const n = typeof stock === 'number' ? stock : parseInt(String(stock));
  return Number.isInteger(n) && n >= 0 && n <= 100000;
}

export function isValidId(id: unknown): boolean {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(id);
}

export function isValidUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

// Strip HTML tags to prevent XSS in stored strings
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

export function validateProductInput(body: any): { valid: boolean; error?: string } {
  const name  = sanitizeStr(body.name, 200);
  const price = parseFloat(body.price);
  const stock = parseInt(body.stock);

  if (!name || name.length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
  if (!isValidPrice(price))     return { valid: false, error: 'Price must be a positive number' };
  if (!isValidStock(stock))     return { valid: false, error: 'Stock must be 0–100,000' };
  if (!body.category || typeof body.category !== 'string') return { valid: false, error: 'Category required' };
  if (body.image && !isValidUrl(body.image) && !body.image.startsWith('/uploads/')) {
    return { valid: false, error: 'Invalid image URL' };
  }
  return { valid: true };
}
