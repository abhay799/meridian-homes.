'use client';
import {useSyncExternalStore} from 'react';
const KEY='meridian-shortlist';
export function readShortlist():string[]{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value.filter((s):s is string=>typeof s==='string'):[]}catch{return []}}
function subscribe(onChange:()=>void){window.addEventListener('meridian-shortlist-changed',onChange);window.addEventListener('storage',onChange);return()=>{window.removeEventListener('meridian-shortlist-changed',onChange);window.removeEventListener('storage',onChange)}}
function getServerSnapshot(){return false}
export function ShortlistButton({id}:{id:string}){const saved=useSyncExternalStore(subscribe,()=>readShortlist().includes(id),getServerSnapshot);function toggle(){const next=new Set(readShortlist());if(next.has(id))next.delete(id);else next.add(id);localStorage.setItem(KEY,JSON.stringify([...next]));window.dispatchEvent(new Event('meridian-shortlist-changed'))}return <button type="button" onClick={toggle} aria-label={saved?'Remove from shortlist':'Add to shortlist'} aria-pressed={saved} style={{background:'#fff',border:'1px solid #cdd2c9',padding:'8px 12px',fontSize:20}}>{saved?'♥':'♡'}</button>}
