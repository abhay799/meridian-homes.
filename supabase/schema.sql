-- MERIDIAN HOMES — Run once in the intended Supabase project.
-- IMPORTANT: authenticated users are NOT automatically admins. Only allowlisted emails pass public.is_admin().
-- Run using Supabase SQL Editor as the database owner. Disable public sign-ups and manually provision administrators.
create extension if not exists pgcrypto;
create table if not exists public.re_properties (
 id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,description text not null,
 listing_type text not null check(listing_type in('buy','rent')),
 property_type text not null check(property_type in('apartment','villa','plot','commercial')),
 price numeric not null check(price>=0), bedrooms integer not null default 0,bathrooms integer not null default 0,
 area_sqft numeric not null check(area_sqft>0),locality text not null,city text not null default 'Bengaluru',address_text text not null,
 amenities text[] not null default '{}',images text[] not null default '{}',featured boolean not null default false,published boolean not null default false,
 created_at timestamptz not null default now());
create table if not exists public.re_enquiries (
 id uuid primary key default gen_random_uuid(),property_id uuid references public.re_properties(id) on delete set null,
 name text not null,phone text not null,email text,preferred_date date,message text,
 enquiry_type text not null check(enquiry_type in('visit','callback','general')),
 status text not null default 'new' check(status in('new','contacted','visit_scheduled','closed','lost')),
 created_at timestamptz not null default now());
create table if not exists public.re_announcements (
 id uuid primary key default gen_random_uuid(),message text not null,active boolean not null default false,created_at timestamptz not null default now());
-- Email allowlist: intentionally no anon/authenticated RLS policies or grants on this table.
create table if not exists public.re_admins (
 email text primary key check (email = lower(btrim(email)) and length(email) > 3)
);
alter table public.re_admins enable row level security;
revoke all on public.re_admins from public, anon, authenticated;
-- The function owner (SQL Editor/postgres) reads re_admins under SECURITY DEFINER.
-- Empty search_path prevents untrusted shadow objects, and the table is fully qualified.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
 select exists (
  select 1 from public.re_admins
  where email = lower(btrim(auth.jwt() ->> 'email'))
 );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
-- Adding an admin (run separately in SQL Editor):
-- insert into public.re_admins(email) values ('your-email@example.com') on conflict do nothing;
alter table public.re_properties enable row level security;
alter table public.re_enquiries enable row level security;
alter table public.re_announcements enable row level security;
revoke all on public.re_properties,public.re_enquiries,public.re_announcements from anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select on public.re_properties,public.re_announcements to anon;
grant insert(name,phone,email,preferred_date,message,enquiry_type,property_id,status) on public.re_enquiries to anon;
grant all on public.re_properties,public.re_enquiries,public.re_announcements to authenticated;
-- Sample's public reads use published or active records only.
drop policy if exists "sample public listings" on public.re_properties;
create policy "sample public listings" on public.re_properties for select to anon using (published=true);
drop policy if exists "sample public announcements" on public.re_announcements;
create policy "sample public announcements" on public.re_announcements for select to anon using (active=true);
drop policy if exists "sample public enquiry insert" on public.re_enquiries;
create policy "sample public enquiry insert" on public.re_enquiries for insert to anon with check (status='new');
-- Authenticated sessions only gain management access if public.is_admin() is true.
drop policy if exists "admin properties" on public.re_properties;
create policy "admin properties" on public.re_properties for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin enquiries" on public.re_enquiries;
create policy "admin enquiries" on public.re_enquiries for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin announcements" on public.re_announcements;
create policy "admin announcements" on public.re_announcements for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('property-images','property-images',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=3145728,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "property image public view" on storage.objects;
create policy "property image public view" on storage.objects for select to anon using(bucket_id='property-images');
drop policy if exists "property image admin insert" on storage.objects;
create policy "property image admin insert" on storage.objects for insert to authenticated with check(bucket_id='property-images' and (select public.is_admin()));
drop policy if exists "property image admin update" on storage.objects;
create policy "property image admin update" on storage.objects for update to authenticated using(bucket_id='property-images' and (select public.is_admin())) with check(bucket_id='property-images' and (select public.is_admin()));
drop policy if exists "property image admin delete" on storage.objects;
create policy "property image admin delete" on storage.objects for delete to authenticated using(bucket_id='property-images' and (select public.is_admin()));
-- Six rows matching local seed data for immediate database-mode operation.
insert into public.re_properties(id,slug,title,description,listing_type,property_type,price,bedrooms,bathrooms,area_sqft,locality,city,address_text,amenities,images,featured,published) values
 ('00000000-0000-4000-8000-000000000001','cedar-court','Cedar Court','Sample apartment concept in Indiranagar, Bengaluru. Illustrative content only.','buy','apartment',8500000,2,2,1120,'Indiranagar','Bengaluru','Sample address, Indiranagar, Bengaluru',array['Parking','Security'],array['/properties/apartment.svg'],true,true),
 ('00000000-0000-4000-8000-000000000002','the-grove-residence','The Grove Residence','Sample villa concept in Whitefield, Bengaluru. Illustrative content only.','buy','villa',19500000,3,3,2380,'Whitefield','Bengaluru','Sample address, Whitefield, Bengaluru',array['Parking','Garden'],array['/properties/villa.svg'],true,true),
 ('00000000-0000-4000-8000-000000000003','orchard-square','Orchard Square','Sample rental apartment concept in Sarjapur Road, Bengaluru. Illustrative content only.','rent','apartment',42000,2,2,1240,'Sarjapur Road','Bengaluru','Sample address, Sarjapur Road, Bengaluru',array['Security'],array['/properties/apartment.svg'],true,true),
 ('00000000-0000-4000-8000-000000000004','amberline-plot','Amberline Plot','Sample plot concept in Yelahanka, Bengaluru. Illustrative content only.','buy','plot',6800000,0,0,1800,'Yelahanka','Bengaluru','Sample address, Yelahanka, Bengaluru',array['Road access'],array['/properties/plot.svg'],true,true),
 ('00000000-0000-4000-8000-000000000005','northwood-office','Northwood Office','Sample commercial rental concept in Hebbal, Bengaluru. Illustrative content only.','rent','commercial',95000,0,1,1650,'Hebbal','Bengaluru','Sample address, Hebbal, Bengaluru',array['Parking'],array['/properties/commercial.svg'],false,true),
 ('00000000-0000-4000-8000-000000000006','cypress-heights','Cypress Heights','Sample apartment concept in Jayanagar, Bengaluru. Illustrative content only.','buy','apartment',14200000,3,3,1580,'Jayanagar','Bengaluru','Sample address, Jayanagar, Bengaluru',array['Parking','Security'],array['/properties/tower.svg'],false,true)
on conflict (slug) do nothing;
