# Meridian Homes — fictional real estate agency demo

A Next.js App Router, TypeScript, Tailwind and Supabase sample product. **Demo website, sample data**. All properties, prices, agents and testimonials are fabricated. RERA references are placeholders (`sample-0000`). This website records enquiries and **does not book actual site visits**.

## Install and deploy — ordered checklist

1. **Unzip**, open the project directory in a terminal, ensure Node.js 22 is active, then run `npm install`. This creates `package-lock.json`.
2. **Copy `.env.example` to `.env.local`** and fill in the Supabase project URL, public anon/publishable key, public WhatsApp number and `ALLOW_INDEXING=false`. Never commit `.env.local`.
3. **Run `supabase/schema.sql`** in the intended Supabase project's SQL Editor. Review before running when reusing a Supabase project.
4. **Confirm** the public `property-images` bucket exists in Supabase Storage, permitting JPG/PNG/WebP up to 3 MB.
5. **Disable public sign-ups in Supabase**, then manually create the trusted admin user in Supabase Authentication. **Add the administrator email to `public.re_admins` using the SQL below**. Merely signing in does not grant management permissions.
6. **Run `npm run verify`** (typecheck, ESLint, production build); resolve all errors before deployment.
7. **Run `npm run dev`** and test the website at http://localhost:3000.
8. **Commit `package-lock.json`**, push to GitHub, connect the repository to the existing/new Vercel project as appropriate, set Node.js 22 and all necessary environment variables in Vercel, then **redeploy**. GitHub CI currently uses `npm install` because no lockfile ships in this archive; once the lockfile is committed, switch CI to `npm ci` for reproducible installs.

## Administrator email allowlist

`supabase/schema.sql` creates `public.re_admins` with `email text primary key`, enables RLS on it, and grants **no public table access or policies**. The `public.is_admin()` `SECURITY DEFINER` function checks `auth.jwt() ->> 'email'` against this private allowlist. It is executable only by authenticated users; unauthenticated visitors cannot read the list. The function must be created by a trusted SQL Editor database owner so it can read the private table.

After applying `supabase/schema.sql` and manually creating your Supabase Auth user, open **Supabase Dashboard → SQL Editor** and execute (replace the example with your own *actual* administrator email, lowercased):

```sql
insert into public.re_admins (email)
values ('your-email@example.com')
on conflict (email) do nothing;
```

Check the allowlist from SQL Editor (not from the website):

```sql
select email from public.re_admins order by email;
```

Then sign out and sign back in to `/admin/login` to refresh the JWT. Admin-only table and storage policies require `public.is_admin()` to be true. If an already-deployed database has broad custom or old policies, audit `pg_policies` and remove any additional permissive policies that expose these tables or the `property-images` bucket. RLS policies are OR-combined; an extra permissive policy can undermine this allowlist. Re-running the supplied schema replaces this demo's named policies, but does not delete unrelated policies.

To revoke access, run `delete from public.re_admins where email = 'your-email@example.com';` in SQL Editor. The route checks the function on every admin request. Also disable or delete accounts that should no longer be able to authenticate.

## Routes

`/`, `/listings`, `/listings/[slug]`, `/emi`, `/about`, `/contact`, `/shortlist`, `/admin/login`, `/admin`, `/admin/properties`, `/admin/enquiries`, `/api/enquiries`, `/api/health`.

## How to test

- Listings: try `?listing_type=buy&property_type=apartment&sort=price_asc`, next-page links, and unmatched locality. Filter parameters remain in the URL.
- Property details: select a listing, review facts and illustrative RERA, save shortlist, adjust EMI, open WhatsApp and request a visit.
- Enquiry: wait **at least three seconds** after form loads, fill name, Indian 10-digit mobile number, consent and a preferred future date, submit. SQL: `select name, phone, status, created_at from public.re_enquiries order by created_at desc limit 5;`. Expect `new` status. A filled honeypot returns success without storing anything.
- Admin: sign in at `/admin/login`, visit Properties, create a sample listing, add JPG/PNG/WebP images (3 MB each, maximum 8), save, publish, feature, edit, delete; then Enquiries, search, filter, update a status and export CSV.
- Fallback: with DB down or published table empty, public listings use `src/lib/seed-data.ts` containing 14 typed sample properties. This is by design; admin pages do **not** use fallback.

## Architecture and protections

`src/lib/data/properties.ts` is the single source for published public properties, with seed fallback. `src/lib/types.ts` defines the shared property type. SSR uses `@supabase/ssr`; **Next.js 16 `src/proxy.ts`** refreshes auth and redirects protected routes. RLS is required and enabled for all prefixed tables; an email allowlist (`re_admins`) gates administrator access. Images have local SVG fallbacks; Supabase Storage host is whitelisted conditionally. Shortlist uses browser-only storage after mount. No extra map/animation/UI libraries.

## Known limitations

- This is a demonstration, **not a real agency**; all prices, identities, addresses, testimonials and properties are sample data. No actual site visit confirmation.
- No transactional email, SMS notifications, payment processing or hard delivery guarantees.
- Client-side minimum three-second guard and honeypot are basic bot friction, not robust rate limiting; add server-side rate limiting and abuse monitoring before accepting real customer data.
- Public listings are fetched all-at-once and filtered in memory; large production inventories need indexed server-side querying and pagination.
- The shortlist stores IDs locally and its saved metadata comes from seed fixtures; database-only properties may not show full details in shortlist.
- Enquiry schema intentionally does not store the consent field; retain appropriate privacy policy / proof of consent for genuine production use.
- A free Supabase project can still pause despite the daily cron. The cron is not a keepalive guarantee.
- Storage objects removed from a property's image list are not automatically deleted from the bucket.
- Administrative table and storage permissions require the email in `public.re_admins` via `public.is_admin()`; unlisted authenticated users are denied by RLS. Disable public signups and create only trusted users. The admin route helper also checks the allowlist. Treat JWT email claims as trusted only for accounts secured in Supabase Auth; changes to a user email may require a fresh session to appear in their token.
- The SQL migration is designed for fresh installation and is not a general migration engine. Existing installations should back up their schema and review the migration before rerunning it. Database outages fall back to the 14 seed properties; the six database records are deliberately a subset.
- `next/font` requests Google fonts during build; offline builds may require an online environment or vendored font assets.

## Build verification disclosure for this archive

This archive was assembled in an environment where npm registry access was unavailable, so `npm install`, `npm run typecheck`, `npm run lint` and `npm run build` could not be completed. A TypeScript parser syntax diagnostic pass reported zero syntax diagnostics across source files. The archive has no lockfile yet; running `npm install` with network access is required to generate it before GitHub Actions can use reproducible `npm ci`. Treat this as source-ready but **not build-certified** until local verification is green.

## Source audit (revision)

Required files were present in the original archive. The files below were updated: package.json, next.config.ts, .github/workflows/ci.yml, src/components/EnquiryForm.tsx, src/lib/seed-data.ts, and README.md. This source revision is **not build-certified**: npm install, typecheck, lint, and build were not executed successfully here. Verify locally before deploying.
