import { redirect } from 'next/navigation';
import { serverSupabase } from './server';

export async function requireAdmin() {
  const client = await serverSupabase();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) redirect('/admin/login');
  const { data: allowed, error: permissionError } = await client.rpc('is_admin');
  if (permissionError || allowed !== true) redirect('/admin/login?error=unauthorized');
  return client;
}
