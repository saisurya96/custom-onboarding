import { Handler } from '@netlify/functions';
import { getSupabaseServiceClient } from './_client';
import { parseCookieFromHeaders } from './_cookies';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, 'Method Not Allowed');
  const supabase = getSupabaseServiceClient();

  const sessionId = parseCookieFromHeaders(new Headers(event.headers as Record<string, string>));
  if (!sessionId) return resp(401, 'No session');

  const { data: sess, error: sessErr } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (sessErr || !sess) return resp(401, 'Invalid session');

  const { step, data } = JSON.parse(event.body || '{}');
  if (![2, 3].includes(step)) return resp(400, 'Invalid step');

  const updates: Record<string, unknown> = {};
  if (typeof data?.about === 'string') updates.about_me = data.about;
  if (typeof data?.birthdate === 'string') updates.birthdate = data.birthdate;
  for (const k of ['address_street','address_city','address_state','address_zip'] as const) {
    if (typeof data?.[k] === 'string') updates[k] = data[k];
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: sess.user_id, ...updates }, { onConflict: 'user_id' });
    if (error) return resp(500, error.message);
  }

  const next = Math.min(3, step + 1);
  const { error: stepErr } = await supabase
    .from('onboarding_sessions')
    .update({ current_step: next })
    .eq('id', sessionId);
  if (stepErr) return resp(500, stepErr.message);

  return resp(200, { ok: true, nextStep: next });
};

function resp(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? JSON.stringify({ error: body }) : JSON.stringify(body),
  };
}


