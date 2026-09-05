import prisma from '../../database/database';
import { RegisterInput } from './auth.schema';
import { UserRole, Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
      include: {
        farmerProfile: true,
        transporterProfile: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        farmerProfile: true,
        transporterProfile: true,
      },
    });
  }

  async createUserWithProfile(input: RegisterInput, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: input.phone,
          passwordHash,
          name: input.name,
          role: input.role,
        },
      });

      if (input.role === UserRole.FARMER) {
        await tx.farmerProfile.create({
          data: {
            userId: user.id,
            address: input.address ?? null,
            village: input.village ?? null,
            district: input.district ?? null,
            state: input.state ?? null,
            pincode: input.pincode ?? null,
            latitude: input.latitude !== undefined ? new Prisma.Decimal(input.latitude) : null,
            longitude: input.longitude !== undefined ? new Prisma.Decimal(input.longitude) : null,
          },
        });
      } else if (input.role === UserRole.TRANSPORTER) {
        await tx.transporterProfile.create({
          data: {
            userId: user.id,
            licenseNumber: input.licenseNumber ?? null,
            licensePhotoUrl: input.licensePhotoUrl ?? null,
            aadhaarNumber: input.aadhaarNumber ?? null,
            aadhaarFrontUrl: input.aadhaarFrontUrl ?? null,
            aadhaarBackUrl: input.aadhaarBackUrl ?? null,
            kycStatus: 'PENDING',
            isVerified: false,
            address: input.address ?? null,
            latitude: input.latitude !== undefined ? new Prisma.Decimal(input.latitude) : null,
            longitude: input.longitude !== undefined ? new Prisma.Decimal(input.longitude) : null,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          farmerProfile: true,
          transporterProfile: true,
        },
      });
    });
  }

  async updateProfile(userId: string, input: import('./auth.schema').UpdateProfileInput) {
    return prisma.$transaction(async (tx) => {
      if (input.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.name },
        });
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { farmerProfile: true, transporterProfile: true },
      });

      if (!user) return null;

      if (user.role === UserRole.FARMER) {
        await tx.farmerProfile.upsert({
          where: { userId },
          create: {
            userId,
            address: input.address ?? null,
            village: input.village ?? null,
            district: input.district ?? null,
            state: input.state ?? null,
            pincode: input.pincode ?? null,
            latitude: input.latitude !== undefined && input.latitude !== null ? new Prisma.Decimal(input.latitude) : null,
            longitude: input.longitude !== undefined && input.longitude !== null ? new Prisma.Decimal(input.longitude) : null,
          },
          update: {
            address: input.address !== undefined ? input.address : undefined,
            village: input.village !== undefined ? input.village : undefined,
            district: input.district !== undefined ? input.district : undefined,
            state: input.state !== undefined ? input.state : undefined,
            pincode: input.pincode !== undefined ? input.pincode : undefined,
            latitude: input.latitude !== undefined ? (input.latitude !== null ? new Prisma.Decimal(input.latitude) : null) : undefined,
            longitude: input.longitude !== undefined ? (input.longitude !== null ? new Prisma.Decimal(input.longitude) : null) : undefined,
          },
        });
      } else if (user.role === UserRole.TRANSPORTER) {
        // Storage cleanup: if new photos are provided, delete the old ones from Supabase storage
        const { deleteFileFromStorage } = require('../../shared/utils/storage.utils');
        if (
          input.licensePhotoUrl !== undefined &&
          user.transporterProfile?.licensePhotoUrl &&
          user.transporterProfile.licensePhotoUrl !== input.licensePhotoUrl
        ) {
          deleteFileFromStorage(user.transporterProfile.licensePhotoUrl).catch((e: any) =>
            console.warn('[STORAGE_CLEANUP_WARN]', e)
          );
        }
        if (
          input.aadhaarFrontUrl !== undefined &&
          user.transporterProfile?.aadhaarFrontUrl &&
          user.transporterProfile.aadhaarFrontUrl !== input.aadhaarFrontUrl
        ) {
          deleteFileFromStorage(user.transporterProfile.aadhaarFrontUrl).catch((e: any) =>
            console.warn('[STORAGE_CLEANUP_WARN]', e)
          );
        }
        if (
          input.aadhaarBackUrl !== undefined &&
          user.transporterProfile?.aadhaarBackUrl &&
          user.transporterProfile.aadhaarBackUrl !== input.aadhaarBackUrl
        ) {
          deleteFileFromStorage(user.transporterProfile.aadhaarBackUrl).catch((e: any) =>
            console.warn('[STORAGE_CLEANUP_WARN]', e)
          );
        }

        const isVerifiedUpdate =
          input.isVerified !== undefined
            ? input.isVerified
            : input.kycStatus === 'APPROVED'
            ? true
            : input.kycStatus === 'REJECTED' || input.kycStatus === 'PENDING'
            ? false
            : undefined;

        const verifiedAtUpdate = isVerifiedUpdate ? new Date() : input.kycStatus === 'REJECTED' || input.kycStatus === 'PENDING' ? null : undefined;
        const rejectionReasonUpdate = input.kycStatus === 'PENDING' ? null : input.rejectionReason;

        await tx.transporterProfile.upsert({
          where: { userId },
          create: {
            userId,
            licenseNumber: input.licenseNumber ?? null,
            licensePhotoUrl: input.licensePhotoUrl ?? null,
            aadhaarNumber: input.aadhaarNumber ?? null,
            aadhaarFrontUrl: input.aadhaarFrontUrl ?? null,
            aadhaarBackUrl: input.aadhaarBackUrl ?? null,
            kycStatus: input.kycStatus ?? 'PENDING',
            isVerified: isVerifiedUpdate ?? false,
            rejectionReason: rejectionReasonUpdate ?? null,
            verifiedAt: verifiedAtUpdate,
            address: input.address ?? null,
            latitude: input.latitude !== undefined && input.latitude !== null ? new Prisma.Decimal(input.latitude) : null,
            longitude: input.longitude !== undefined && input.longitude !== null ? new Prisma.Decimal(input.longitude) : null,
          },
          update: {
            licenseNumber: input.licenseNumber !== undefined ? input.licenseNumber : undefined,
            licensePhotoUrl: input.licensePhotoUrl !== undefined ? input.licensePhotoUrl : undefined,
            aadhaarNumber: input.aadhaarNumber !== undefined ? input.aadhaarNumber : undefined,
            aadhaarFrontUrl: input.aadhaarFrontUrl !== undefined ? input.aadhaarFrontUrl : undefined,
            aadhaarBackUrl: input.aadhaarBackUrl !== undefined ? input.aadhaarBackUrl : undefined,
            kycStatus: input.kycStatus !== undefined ? input.kycStatus : undefined,
            isVerified: isVerifiedUpdate !== undefined ? isVerifiedUpdate : undefined,
            rejectionReason: rejectionReasonUpdate !== undefined ? rejectionReasonUpdate : undefined,
            verifiedAt: verifiedAtUpdate !== undefined ? verifiedAtUpdate : undefined,
            address: input.address !== undefined ? input.address : undefined,
            latitude: input.latitude !== undefined ? (input.latitude !== null ? new Prisma.Decimal(input.latitude) : null) : undefined,
            longitude: input.longitude !== undefined ? (input.longitude !== null ? new Prisma.Decimal(input.longitude) : null) : undefined,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: { farmerProfile: true, transporterProfile: true },
      });
    });
  }

  async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string
  ) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  }

  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
