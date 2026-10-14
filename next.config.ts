import type { NextConfig } from 'next';
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [];
try {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (raw) {
    const parsed = new URL(raw);
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')) {
      remotePatterns.push({ protocol: 'https', hostname: parsed.hostname, pathname: '/storage/v1/object/public/**' });
    }
  }
} catch { /* Invalid placeholder values must not crash configuration loading. */ }
const config: NextConfig = { images: { remotePatterns } };
export default config;
