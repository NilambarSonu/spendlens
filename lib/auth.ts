import crypto from 'crypto';
import { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'spendlens_session';
const JWT_SECRET = process.env.NEON_AUTH_COOKIE_SECRET || 'a_very_secure_secret_at_least_32_chars_long';

// Secure password hashing using PBKDF2 (Node.js built-in, no external binaries required)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Lightweight secure session token generation
export function createSessionToken(userId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ userId, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })).toString('base64url'); // 7 days
  
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${header}.${payload}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${payload}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; email: string } | null {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(`${header}.${payload}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    // Parse and verify expiry
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return {
      userId: decodedPayload.userId,
      email: decodedPayload.email
    };
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): { userId: string; email: string } | null {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}

export function getAuthCookieHeader(token: string): string {
  return `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

export function getLogoutCookieHeader(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
