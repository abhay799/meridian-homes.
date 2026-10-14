import {env} from '@/lib/env';
export function whatsappLink(title?:string){return `https://wa.me/${env.NEXT_PUBLIC_WHATSAPP}?text=${encodeURIComponent(title?`Hello, I would like a site visit for ${title} (sample property).`:'Hello Meridian Homes, I would like a callback about a sample property.')}`;}
export function WhatsApp({title}:{title?:string}){return <a className="whatsapp" href={whatsappLink(title)} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
