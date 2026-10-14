
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function proxy(
  request: NextRequest
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const client = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          list.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await client.auth.getUser();

  const path = request.nextUrl.pathname;

  if (
    path.startsWith('/admin') &&
    !path.startsWith('/admin/login') &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
