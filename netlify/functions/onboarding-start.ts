import { Handler } from '@netlify/functions';
import { getSupabaseServiceClient } from './_client';
import { ensureSessionCookie, parseCookieFromHeaders } from './_cookies';
import bcrypt from 'bcryptjs';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, 'Method Not Allowed');
  const supabase = getSupabaseServiceClient();

  const { email, password } = JSON.parse(event.body || '{}');
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') return resp(400, 'Invalid body');

  const password_hash = await bcrypt.hash(password, 10);

  const { data: userRow, error: upsertErr } = await supabase
    .from('users')
    .upsert({ email, password_hash }, { onConflict: 'email' })
    .select('*')
    .single();
  if (upsertErr) return resp(500, upsertErr.message);

  const existingId = parseCookieFromHeaders(new Headers(event.headers as Record<string, string>));
  const { id: sessionId, cookie } = ensureSessionCookie(existingId);

  const { error: sessErr } = await supabase
    .from('onboarding_sessions')
    .upsert({ id: sessionId, user_id: userRow.id, current_step: 2 }, { onConflict: 'id' });
  if (sessErr) return resp(500, sessErr.message);

  const { data: conf } = await supabase.from('onboarding_components').select('component,page');
  const page2: string[] = []; const page3: string[] = [];
  for (const r of conf ?? []) { (r.page === 2 ? page2 : page3).push(r.component); }

  return resp(200, { currentStep: 2, config: { page2, page3 } }, cookie);
};

function resp(statusCode: number, body: unknown, setCookie?: string) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...(setCookie ? { 'Set-Cookie': setCookie } : {}) },
    body: typeof body === 'string' ? JSON.stringify({ error: body }) : JSON.stringify(body),
  };
}


