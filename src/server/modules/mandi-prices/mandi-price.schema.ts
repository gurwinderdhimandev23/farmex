import { z } from 'zod';

export const mandiPriceGradeInputSchema = z
  .object({
    id: z.string().optional(),
    gradeName: z
      .string()
      .trim()
      .min(1, 'Grade name is required (e.g. Grade A, Grade B)')
      .max(50, 'Grade name is too long'),
    minPrice: z
      .number({ message: 'Min price must be a number' })
      .positive('Min price must be greater than zero'),
    maxPrice: z
      .number({ message: 'Max price must be a number' })
      .positive('Max price must be greater than zero'),
  })
  .refine((data) => data.maxPrice >= data.minPrice, {
    message: 'Max price must be greater than or equal to min price',
    path: ['maxPrice'],
  });

export const createMandiPriceSchema = z.object({
  mandiName: z
    .string()
    .trim()
    .min(1, 'Mandi name is required')
    .max(100, 'Mandi name is too long'),
  productName: z
    .string()
    .trim()
    .min(1, 'Product/Crop name is required')
    .max(100, 'Product name is too long'),
  price: z
    .number()
    .positive('Price must be greater than zero')
    .optional(),
  unit: z.string().trim().default('Quintal'),
  grades: z
    .array(mandiPriceGradeInputSchema)
    .min(1, 'At least one grade with min and max price is required'),
});

export const updateMandiPriceSchema = z.object({
  mandiName: z.string().trim().min(1).max(100).optional(),
  productName: z.string().trim().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  unit: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  grades: z.array(mandiPriceGradeInputSchema).min(1).optional(),
});

export const mandiPriceQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z.string().optional().transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 50)),
  mandiName: z.string().optional(),
  productName: z.string().optional(),
  sortBy: z.enum(['updatedAt', 'price', 'productName', 'mandiName']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type MandiPriceGradeInput = z.infer<typeof mandiPriceGradeInputSchema>;
export type CreateMandiPriceInput = z.infer<typeof createMandiPriceSchema>;
export type UpdateMandiPriceInput = z.infer<typeof updateMandiPriceSchema>;
export type MandiPriceQueryInput = z.infer<typeof mandiPriceQuerySchema>;

