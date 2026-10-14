export function formatPrice(amount:number):string {
 if (!Number.isFinite(amount) || amount < 0) return 'Rs 0';
 if (amount === 0) return 'Rs 0';
 const nice=(x:number)=> Number(x.toFixed(2)).toLocaleString('en-IN',{maximumFractionDigits:2});
 if (amount >= 10000000) return `Rs ${nice(amount/10000000)} Cr`;
 if (amount >= 100000) return `Rs ${nice(amount/100000)} Lakh`;
 return `Rs ${Math.round(amount).toLocaleString('en-IN')}`;
}
export function formatArea(n:number):string {return `${n.toLocaleString('en-IN')} sq ft`;}
