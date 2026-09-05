import { z } from 'zod';
import { TripStatus, AssignmentStatus } from '@prisma/client';

export const assignTransporterSchema = z.object({
  enquiryId: z.string().trim().min(1, 'Enquiry ID is required'),
  transporterId: z.string().trim().min(1, 'Transporter ID is required'),
  vehicleId: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const respondAssignmentSchema = z.object({
  status: z.enum([AssignmentStatus.ACCEPTED, AssignmentStatus.REJECTED], {
    message: 'Status must be ACCEPTED or REJECTED',
  }),
  rejectionReason: z.string().trim().max(500).optional(),
  vehicleId: z.string().trim().optional(),
});

export const updateTripStatusSchema = z.object({
  status: z.enum(
    [
      TripStatus.PICKUP,
      TripStatus.IN_TRANSIT,
      TripStatus.ON_DESTINATION,
      TripStatus.DELIVERED,
    ],
    {
      message: 'Status must be PICKUP, IN_TRANSIT, ON_DESTINATION, or DELIVERED',
    }
  ),
  startOdometer: z.number().nonnegative().optional(),
  endOdometer: z.number().nonnegative().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const tripQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  status: z.nativeEnum(TripStatus).optional(),
  transporterId: z.string().optional(),
  enquiryId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'pickupTime', 'deliveryTime', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AssignTransporterInput = z.infer<typeof assignTransporterSchema>;
export type RespondAssignmentInput = z.infer<typeof respondAssignmentSchema>;
export type UpdateTripStatusInput = z.infer<typeof updateTripStatusSchema>;
export type TripQueryInput = z.infer<typeof tripQuerySchema>;
