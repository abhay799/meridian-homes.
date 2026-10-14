'use client';
import Image from 'next/image';import {useState} from 'react';
export function PropertyImage({src,alt,priority=false}:{src:string;alt:string;priority?:boolean}){const[url,setUrl]=useState(src);return <Image src={url} alt={alt} width={1100} height={700} priority={priority} onError={()=>setUrl('/properties/apartment.svg')} style={{width:'100%',height:'auto',aspectRatio:'11/7',objectFit:'cover'}}/>}
