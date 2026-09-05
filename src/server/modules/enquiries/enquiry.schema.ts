import { z } from 'zod';
import { EnquiryStatus } from '@prisma/client';

export const enquiryLabourItemSchema = z.object({
  labourTypeId: z.string().trim().min(1, 'Labour type ID is required'),
  quantity: z.number().int().positive('Labour quantity must be at least 1').default(1),
  notes: z.string().trim().max(500).optional(),
});

export const createEnquirySchema = z.object({
  pickupLocation: z
    .string()
    .trim()
    .min(1, 'Pickup location is required')
    .max(500, 'Pickup location is too long'),
  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),

  destinationLocation: z
    .string()
    .trim()
    .min(1, 'Destination location is required')
    .max(500, 'Destination location is too long'),
  destinationLatitude: z.number().optional(),
  destinationLongitude: z.number().optional(),

  materialName: z
    .string()
    .trim()
    .min(1, 'Material / Crop name is required')
    .max(100, 'Material name is too long'),
  quantityKg: z
    .number()
    .positive('Quantity must be greater than zero'),

  vehicleTypeId: z.string().trim().optional(),
  vehicleRequirement: z.string().trim().max(200).optional(),

  pickupDate: z
    .string()
    .datetime({ message: 'Pickup date must be a valid ISO date-time string' }),
  preferredTimeSlot: z.string().trim().max(100).optional(),

  labourRequired: z.boolean().default(false),
  labourItems: z.array(enquiryLabourItemSchema).optional(),
  notes: z.string().trim().max(1000).optional(),
  isReturnLoad: z.boolean().default(false),

  // Sell from Farm (Ghar Se Beche)
  isSellFromFarm: z.boolean().default(false),
  samplePreferredDate: z.string().optional(),
  samplePreferredSlot: z.string().trim().max(100).optional(),
  distanceFromRewariKm: z.number().nonnegative().optional(),
});

export const updateSampleStatusSchema = z.object({
  sampleStatus: z.enum(['PENDING_COLLECTION', 'COLLECTION_ASSIGNED', 'SAMPLE_COLLECTED', 'APPROVED', 'REJECTED']),
  sampleCollectorNotes: z.string().trim().max(1000).optional(),
  labReportImageUrl: z.string().optional(),
  labRemarks: z.string().trim().max(1000).optional(),
  quotedPricePerQtl: z.number().positive().optional(),
  distanceFromRewariKm: z.number().nonnegative().optional(),
});

export const enquiryQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  status: z.nativeEnum(EnquiryStatus).optional(),
  farmerId: z.string().optional(),
  isReturnLoad: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  sortBy: z.enum(['createdAt', 'pickupDate', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const reviewEnquirySchema = z.object({
  status: z.enum([EnquiryStatus.ADMIN_ACCEPTED, EnquiryStatus.ADMIN_REJECTED], {
    message: 'Status must be ADMIN_ACCEPTED or ADMIN_REJECTED',
  }),
  notes: z.string().trim().max(1000).optional(),
});

export const cancelEnquirySchema = z.object({
  notes: z.string().trim().max(1000).optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type EnquiryQueryInput = z.infer<typeof enquiryQuerySchema>;
export type ReviewEnquiryInput = z.infer<typeof reviewEnquirySchema>;
export type CancelEnquiryInput = z.infer<typeof cancelEnquirySchema>;
