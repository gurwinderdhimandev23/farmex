import { z } from 'zod';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export const recordCashPaymentSchema = z.object({
  enquiryId: z.string().trim().min(1, 'Enquiry ID is required'),
  tripId: z.string().trim().optional(),
  amount: z.number().positive('Payment amount must be greater than zero'),
  idempotencyKey: z.string().trim().min(1, 'Idempotency key is required'),
  transactionId: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const paymentQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  enquiryId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'paidAt', 'amount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type RecordCashPaymentInput = z.infer<typeof recordCashPaymentSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
