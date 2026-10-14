'use client';
import{browserSupabase}from'@/lib/supabase/browser';import{useRouter}from'next/navigation';export function LogoutButton(){const router=useRouter();return <button className="btn btn-alt" onClick={async()=>{await browserSupabase().auth.signOut();router.push('/admin/login');router.refresh()}}>Logout</button>}
