import { Handler } from '@netlify/functions';
import { clearSessionCookie, parseCookieFromHeaders } from './_cookies';
import { getSupabaseServiceClient } from './_client';

export const handler: Handler = async (event) => {
  const supabase = getSupabaseServiceClient();
  const sessionId = parseCookieFromHeaders(new Headers(event.headers as Record<string, string>));
  if (sessionId) {
    await supabase.from('onboarding_sessions').delete().eq('id', sessionId);
  }
  return {
    statusCode: 200,
    headers: { 'Set-Cookie': clearSessionCookie(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};


