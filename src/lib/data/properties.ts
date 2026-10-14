import type { Property } from '@/lib/types';
import { seedProperties } from '@/lib/seed-data';
import { TABLES } from '@/lib/constants';
import { serverSupabase } from '@/lib/supabase/server';
export async function getPublishedProperties():Promise<Property[]>{
 try { const client=await serverSupabase();const {data,error}=await client.from(TABLES.properties).select('*').eq('published',true).order('created_at',{ascending:false});
 if(error||!data?.length)return seedProperties;return data as Property[];
 }catch{return seedProperties;}
}
export async function getProperty(slug:string):Promise<Property|undefined>{return (await getPublishedProperties()).find(p=>p.slug===slug);}
