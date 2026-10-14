import type { PROPERTY_TYPES, LISTING_TYPES, STATUSES } from './constants';
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ListingType = (typeof LISTING_TYPES)[number];
export type EnquiryStatus = (typeof STATUSES)[number];
export type Property = {
 id:string;slug:string;title:string;description:string;listing_type:ListingType;property_type:PropertyType;
 price:number;bedrooms:number; bathrooms:number;area_sqft:number;locality:string;city:string;address_text:string;
 amenities:string[];images:string[];featured:boolean;published:boolean;created_at:string;
};
export type Enquiry = {id:string;property_id:string|null;name:string;phone:string;email:string|null;preferred_date:string|null;message:string|null;enquiry_type:'visit'|'callback'|'general';status:EnquiryStatus;created_at:string};
