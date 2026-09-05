import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const registerSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password is too long'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  role: z.nativeEnum(UserRole, {
    message: 'Role must be FARMER, TRANSPORTER, or ADMIN',
  }),
  // Optional profile fields for Farmer & Transporter
  address: z.string().trim().max(500).optional(),
  village: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Optional profile fields for Transporter
  licenseNumber: z.string().trim().max(50).optional(),
  licensePhotoUrl: z.string().trim().optional(),
  aadhaarNumber: z.string().trim().max(20).optional(),
  aadhaarFrontUrl: z.string().trim().optional(),
  aadhaarBackUrl: z.string().trim().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  address: z.string().trim().max(500).optional(),
  village: z.string().trim().max(100).optional(),
  district: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  licenseNumber: z.string().trim().max(50).optional(),
  licensePhotoUrl: z.string().trim().optional(),
  aadhaarNumber: z.string().trim().max(20).optional(),
  aadhaarFrontUrl: z.string().trim().optional(),
  aadhaarBackUrl: z.string().trim().optional(),
  kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  isVerified: z.boolean().optional(),
  rejectionReason: z.string().trim().max(500).optional(),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  password: z
    .string()
    .min(1, 'Password is required'),
});


export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, 'Old password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long')
    .max(100, 'Password is too long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
