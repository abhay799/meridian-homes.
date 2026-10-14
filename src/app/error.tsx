'use client';
import Link from'next/link';export default function Error({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="wrap section"><h1>Something went wrong.</h1><p>Try again or return to the property catalogue.</p><button className="btn" onClick={reset}>Try again</button> <Link href="/listings">Browse properties</Link></main>}
