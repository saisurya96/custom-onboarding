import { Handler } from '@netlify/functions';
import { getSupabaseServiceClient } from './_client';

export const handler: Handler = async (event) => {
  const supabase = getSupabaseServiceClient();

  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase.from('onboarding_components').select('component,page');
    if (error) return resp(500, error.message);
    const page2: string[] = [];
    const page3: string[] = [];
    for (const row of data ?? []) {
      if (row.page === 2) page2.push(row.component);
      else if (row.page === 3) page3.push(row.component);
    }
    return resp(200, { page2, page3 });
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}') as { page2: string[]; page3: string[] };
    if (!Array.isArray(body.page2) || !Array.isArray(body.page3) || body.page2.length === 0 || body.page3.length === 0)
      return resp(400, 'Both pages must have at least one component');
    const valid = new Set(['about', 'address', 'birthdate']);
    const all = [...new Set([...body.page2, ...body.page3])];
    if (all.length !== 3 || all.some((c) => !valid.has(c))) return resp(400, 'All components must be assigned exactly once');

    const upserts = [
      ...body.page2.map((c) => ({ component: c, page: 2 })),
      ...body.page3.map((c) => ({ component: c, page: 3 })),
    ];
    const { error } = await supabase.from('onboarding_components').upsert(upserts, { onConflict: 'component' });
    if (error) return resp(500, error.message);
    return resp(200, { ok: true });
  }

  return resp(405, 'Method Not Allowed');
};

function resp(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? JSON.stringify({ error: body }) : JSON.stringify(body),
  };
}


