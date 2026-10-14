import type { Property } from '../types';
export type SearchFilters={locality?:string;city?:string;listing_type?:string;property_type?:string;bedrooms?:string;min?:string;max?:string;sort?:string;page?:string};
export function filterProperties(properties:Property[],f:SearchFilters){
 const min=Number(f.min||0),max=f.max?Number(f.max):Infinity;
 const items=properties.filter(p=>(!f.city||p.city.toLowerCase().includes(f.city.toLowerCase()))&&(!f.locality||p.locality.toLowerCase().includes(f.locality.toLowerCase()))&&(!f.listing_type||p.listing_type===f.listing_type)&&(!f.property_type||p.property_type===f.property_type)&&(!f.bedrooms||p.bedrooms===Number(f.bedrooms))&&p.price>=min&&p.price<=max);
 const sorted=[...items].sort((a,b)=>f.sort==='price_asc'?a.price-b.price:f.sort==='price_desc'?b.price-a.price:Date.parse(b.created_at)-Date.parse(a.created_at));
 const page=Math.max(1,Number.parseInt(f.page||'1',10)||1),size=6;
 return {items:sorted.slice((page-1)*size,page*size),total:sorted.length,page,pages:Math.max(1,Math.ceil(sorted.length/size))};
}
