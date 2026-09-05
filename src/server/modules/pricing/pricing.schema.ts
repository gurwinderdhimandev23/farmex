import { z } from 'zod';

export const createLabourTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Labour type name is required')
    .max(100, 'Name is too long'),
  description: z.string().trim().max(500).optional(),
  basePrice: z
    .number()
    .nonnegative('Base price cannot be negative'),
});

export const updateLabourTypeSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  basePrice: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const setEnquiryPricingSchema = z.object({
  transportPrice: z
    .number()
    .nonnegative('Transport price cannot be negative'),
  labourPrice: z
    .number()
    .nonnegative('Labour price cannot be negative')
    .default(0),
  notes: z.string().trim().max(1000).optional(),
  labourItemPricings: z
    .array(
      z.object({
        enquiryLabourId: z.string().trim().min(1, 'Enquiry Labour ID is required'),
        unitPrice: z.number().nonnegative('Unit price cannot be negative'),
      })
    )
    .optional(),
});

export const estimatePricingSchema = z.object({
  distanceKm: z.number().nonnegative('Distance cannot be negative'),
  weightQuintals: z.number().positive('Weight must be greater than 0'),
  labourRequired: z.boolean().default(false),
  labourTypeId: z.string().optional(),
});

export type CreateLabourTypeInput = z.infer<typeof createLabourTypeSchema>;
export type UpdateLabourTypeInput = z.infer<typeof updateLabourTypeSchema>;
export type SetEnquiryPricingInput = z.infer<typeof setEnquiryPricingSchema>;
export type EstimatePricingInput = z.infer<typeof estimatePricingSchema>;

