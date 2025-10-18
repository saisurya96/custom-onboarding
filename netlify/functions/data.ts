import { Handler } from '@netlify/functions';
import { getSupabaseServiceClient } from './_client';

export const handler: Handler = async () => {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('users')
    .select('id,email,user_profiles(about_me,birthdate,address_street,address_city,address_state,address_zip)')
    .order('created_at', { ascending: false });
  if (error) return resp(500, error.message);
  const rows = (data ?? []).map((u) => ({ id: u.id, email: u.email, ...(u as any).user_profiles ?? {} }));
  return resp(200, rows);
};

function resp(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}


