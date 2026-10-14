
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function serverSupabase() {
  const store = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },

        setAll(list: CookieToSet[]) {
          try {
            list.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // Server Components cannot always update cookies.
            // The proxy handles session refresh.
          }
        },
      },
    }
  );
}
