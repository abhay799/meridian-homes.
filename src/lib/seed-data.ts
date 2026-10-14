import type { Property } from './types';
const names = [
 ['Cedar Court','Indiranagar','apartment','buy',8500000,2,1120],
 ['The Grove Residence','Whitefield','villa','buy',19500000,3,2380],
 ['Orchard Square','Sarjapur Road','apartment','rent',42000,2,1240],
 ['Amberline Plot','Yelahanka','plot','buy',6800000,0,1800],
 ['Northwood Office','Hebbal','commercial','rent',95000,0,1650],
 ['Cypress Heights','Jayanagar','apartment','buy',14200000,3,1580],
 ['Maple Row','Indiranagar','villa','rent',125000,4,3150],
 ['Willow Garden Plot','Whitefield','plot','buy',11500000,0,2400],
 ['Harbourline Workspace','Sarjapur Road','commercial','buy',22200000,0,2100],
 ['Oakridge Apartment','Yelahanka','apartment','buy',6250000,2,980],
 ['Pine View Flat','Hebbal','apartment','rent',36000,2,1050],
 ['Sunstone Villa','Jayanagar','villa','buy',33500000,4,3620],
 ['Elm Terrace Plot','Yelahanka','plot','buy',8800000,0,2000],
 ['Marigold Studio Office','Whitefield','commercial','rent',72000,0,1280],
] as const;
const iso='2026-01-10T09:00:00.000Z';
export const seedProperties:Property[]=names.map(([title,locality,property_type,listing_type,price,bedrooms,area_sqft],i)=>({
 id:`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,slug:title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
 title,description:`Explore ${title}, a sample ${property_type} concept in ${locality}, Bengaluru. This demonstration listing shows the kind of property details a buyer or tenant can review before requesting a visit. All specifications and pricing are fictional.`,
 listing_type,property_type,price,bedrooms,bathrooms:property_type==='plot'?0:Math.max(1,bedrooms),area_sqft,
 locality,city:'Bengaluru',address_text:`Sample address, ${locality}, Bengaluru`,amenities:property_type==='plot'?['Road access','Corner option','Residential zone']:['Natural light','Parking','Water supply','Security'],
 images:[`/properties/${['apartment','villa','plot','commercial','home','tower'][i%6]}.svg`],featured:i<4,published:true,created_at:iso
}));
export const agents=[
 {name:'Aarav Mehta',role:'Residential specialist',initials:'AM'}, {name:'Mira Shah',role:'Site visit coordinator',initials:'MS'},
 {name:'Ishaan Rao',role:'Leasing specialist',initials:'IR'}, {name:'Tara Nair',role:'Commercial advisor',initials:'TN'},
 {name:'Dev Kapoor',role:'Buyer support',initials:'DK'} ];
export const testimonials=[
 {quote:'The demo enquiry flow is clear and simple.',name:'Sample buyer A'},
 {quote:'The property filters made comparisons easy in this preview.',name:'Sample visitor B'},
 {quote:'The property facts are organised in a useful way.',name:'Sample visitor C'}];
export const faqs=[
 ['Can I schedule a visit?','This demo records an enquiry only; no appointment is confirmed.'],
 ['Are the prices current?','No. All prices are fictional sample values.'],
 ['Are these real listings?','No. Every property is illustrative demo data.'],
 ['Can I request a callback?','Yes. Fill in the callback enquiry form.'],
 ['Are there brokerage charges?','This demo does not quote or charge any fees.'],
 ['Can I save a shortlist?','Yes. Your saved listing IDs stay in this browser.'] ];
