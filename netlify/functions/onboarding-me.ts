import { Handler } from '@netlify/functions';
import { getSupabaseServiceClient } from './_client';
import { parseCookieFromHeaders } from './_cookies';

export const handler: Handler = async (event) => {
  const supabase = getSupabaseServiceClient();
  const sessionId = parseCookieFromHeaders(new Headers(event.headers as Record<string, string>));
  if (!sessionId) return resp(200, { currentStep: 1 });

  const { data: sess } = await supabase.from('onboarding_sessions').select('*').eq('id', sessionId).single();
  const currentStep = sess?.current_step ?? 1;

  const { data: conf } = await supabase.from('onboarding_components').select('component,page');
  const page2: string[] = []; const page3: string[] = [];
  for (const r of conf ?? []) { (r.page === 2 ? page2 : page3).push(r.component); }
  return resp(200, { currentStep, config: { page2, page3 } });
};

function resp(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? JSON.stringify({ error: body }) : JSON.stringify(body),
  };
}


