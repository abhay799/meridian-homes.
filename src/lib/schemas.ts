
import { z } from 'zod';
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  STATUSES,
} from './constants';

// -------------------------
// Enquiry validation schema
// -------------------------

export const enquirySchema = z
  .object({
    property_id: z.uuid().nullable().optional(),

    name: z.string().trim().min(2).max(100),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        'Enter a valid Indian 10-digit mobile number'
      ),

    email: z.union([z.email(), z.literal('')]).optional(),

    preferred_date: z
      .union([z.iso.date(), z.literal('')])
      .optional(),

    message: z.string().max(1000).optional(),

    enquiry_type: z.enum(['visit', 'callback', 'general']),

    // Accept false as a form default, but require true on submission.
    consent: z.boolean().refine((value) => value === true, {
      message: 'You must agree to be contacted.',
    }),

    honeypot: z.string().default(''),

    loaded_at: z.number().int().positive(),
  })
  .superRefine((values, ctx) => {
    if (
      values.preferred_date &&
      values.preferred_date < new Date().toISOString().slice(0, 10)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['preferred_date'],
        message: 'Choose today or a future date',
      });
    }
  });

// -------------------------
// Property validation schema
// -------------------------

export const propertySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  title: z.string().min(5).max(140),

  description: z.string().min(20),

  listing_type: z.enum(LISTING_TYPES),

  property_type: z.enum(PROPERTY_TYPES),

  price: z.coerce.number().nonnegative(),

  bedrooms: z.coerce.number().int().min(0),

  bathrooms: z.coerce.number().int().min(0),

  area_sqft: z.coerce.number().positive(),

  locality: z.string().min(2),

  city: z.string().min(2),

  address_text: z.string().min(5),

  amenities: z.array(z.string()),

  images: z.array(z.string()).max(8),

  featured: z.boolean(),

  published: z.boolean(),
});

// -------------------------
// Enquiry status validation
// -------------------------

export const enquiryStatusSchema = z.enum(STATUSES);
