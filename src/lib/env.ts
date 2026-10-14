import { z } from 'zod';
const schema = z.object({
 NEXT_PUBLIC_SUPABASE_URL:z.url(),
 NEXT_PUBLIC_SUPABASE_ANON_KEY:z.string().min(5),
 NEXT_PUBLIC_WHATSAPP:z.string().regex(/^\d{10,15}$/),
 ALLOW_INDEXING:z.enum(['true','false']).default('false')
});
export const env = schema.parse({
 NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
 NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
 NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP,
 ALLOW_INDEXING: process.env.ALLOW_INDEXING ?? 'false'
});
