import { serialize } from 'cookie';
import { randomUUID } from 'node:crypto';

export function ensureSessionCookie(existing?: string | null) {
  const id = existing ?? randomUUID();
  const cookie = serialize('onboarding_session_id', id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return { id, cookie };
}

export function parseCookieFromHeaders(headers: Headers) {
  const raw = headers.get('cookie');
  if (!raw) return null;
  const parts = raw.split(/;\s*/);
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k === 'onboarding_session_id') return decodeURIComponent(v);
  }
  return null;
}


