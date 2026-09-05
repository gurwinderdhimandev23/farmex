import prisma from '../../database/database';
import { UserRole, EnquiryStatus, TripStatus, PaymentStatus, Prisma } from '@prisma/client';

export class AdminRepository {
  async getDashboardStats() {
    const [
      totalFarmers,
      totalTransporters,
      pendingEnquiriesCount,
      activeEnquiriesCount,
      activeTripsCount,
      completedDeliveriesCount,
      revenueResult,
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.FARMER, isActive: true, deletedAt: null } }),
      prisma.user.count({ where: { role: UserRole.TRANSPORTER, isActive: true, deletedAt: null } }),
      prisma.enquiry.count({ where: { status: EnquiryStatus.SUBMITTED, deletedAt: null } }),
      prisma.enquiry.count({
        where: {
          status: {
            in: [
              EnquiryStatus.ADMIN_ACCEPTED,
              EnquiryStatus.TRANSPORTER_ASSIGNED,
              EnquiryStatus.TRANSPORTER_ACCEPTED,
            ],
          },
          deletedAt: null,
        },
      }),
      prisma.trip.count({
        where: {
          status: {
            in: [TripStatus.PICKUP, TripStatus.IN_TRANSIT, TripStatus.ON_DESTINATION],
          },
        },
      }),
      prisma.enquiry.count({
        where: {
          status: {
            in: [EnquiryStatus.DELIVERED, EnquiryStatus.PAYMENT_COMPLETED],
          },
          deletedAt: null,
        },
      }),
      prisma.payment.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalFarmers,
      totalTransporters,
      pendingEnquiriesCount,
      activeEnquiriesCount,
      activeTripsCount,
      completedDeliveriesCount,
      totalRevenueCash: revenueResult._sum.amount ? revenueResult._sum.amount.toNumber() : 0,
    };
  }

  async getTransporters(pickupLat?: number | null, pickupLng?: number | null, enquiryId?: string | null) {
    let targetLat = pickupLat;
    let targetLng = pickupLng;

    // If enquiryId provided but coordinates missing, retrieve them from enquiry
    if ((targetLat === undefined || targetLat === null || targetLng === undefined || targetLng === null) && enquiryId) {
      const enquiry = await prisma.enquiry.findUnique({
        where: { id: enquiryId },
        select: { pickupLatitude: true, pickupLongitude: true, pickupLocation: true },
      });
      if (enquiry && enquiry.pickupLatitude && enquiry.pickupLongitude) {
        targetLat = enquiry.pickupLatitude.toNumber();
        targetLng = enquiry.pickupLongitude.toNumber();
      }
    }

    const transporters = await prisma.user.findMany({
      where: {
        role: UserRole.TRANSPORTER,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        transporterProfile: {
          select: {
            id: true,
            licenseNumber: true,
            licensePhotoUrl: true,
            aadhaarNumber: true,
            kycStatus: true,
            isVerified: true,
            address: true,
            latitude: true,
            longitude: true,
            status: true,
            vehicles: {
              where: { isActive: true },
              select: {
                id: true,
                registrationNumber: true,
                vehicleType: true,
                capacityTonnes: true,
              },
            },
          },
        },
      },
    });

    const hasTargetCoords =
      targetLat !== undefined &&
      targetLat !== null &&
      targetLng !== undefined &&
      targetLng !== null &&
      !isNaN(targetLat) &&
      !isNaN(targetLng);

    const mappedTransporters = transporters.map((t) => {
      const tLat = t.transporterProfile?.latitude ? t.transporterProfile.latitude.toNumber() : null;
      const tLng = t.transporterProfile?.longitude ? t.transporterProfile.longitude.toNumber() : null;

      let distanceKm: number = 99999;
      let badgeText = 'Distance not available';
      let badgeColor: 'emerald' | 'green' | 'amber' | 'slate' | 'neutral' = 'neutral';

      if (hasTargetCoords && tLat !== null && tLng !== null) {
        const { calculateHaversineDistance, getDistanceBadge } = require('../../shared/utils/geo.utils');
        distanceKm = calculateHaversineDistance(targetLat!, targetLng!, tLat, tLng);
        const badge = getDistanceBadge(distanceKm);
        badgeText = badge.label;
        badgeColor = badge.color;
      }

      return {
        ...t,
        distanceKm: distanceKm === 99999 ? undefined : distanceKm,
        distanceBadge: badgeText,
        badgeColor,
      };
    });

    // Sort ascending by distance (nearest driver first)
    mappedTransporters.sort((a, b) => {
      const distA = a.distanceKm !== undefined ? a.distanceKm : 999999;
      const distB = b.distanceKm !== undefined ? b.distanceKm : 999999;
      return distA - distB;
    });

    return mappedTransporters;
  }

  // --- USER MANAGEMENT METHODS ---

  async getUsers(params?: {
    role?: UserRole;
    kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
    isActive?: boolean;
  }) {
    const where: import('@prisma/client').Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (params?.role) {
      where.role = params.role;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        {
          farmerProfile: {
            OR: [
              { village: { contains: q, mode: 'insensitive' } },
              { district: { contains: q, mode: 'insensitive' } },
              { address: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        {
          transporterProfile: {
            OR: [
              { licenseNumber: { contains: q, mode: 'insensitive' } },
              { aadhaarNumber: { contains: q } },
              { address: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (params?.kycStatus) {
      where.transporterProfile = {
        kycStatus: params.kycStatus,
      };
    }

    return prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        farmerProfile: true,
        transporterProfile: {
          include: {
            vehicles: true,
          },
        },
        _count: {
          select: {
            createdEnquiries: true,
          },
        },
      },
    });
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        transporterProfile: {
          include: {
            vehicles: true,
          },
        },
        createdEnquiries: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateUserByAdmin(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      isActive?: boolean;
      passwordHash?: string;
      address?: string;
      village?: string;
      district?: string;
      state?: string;
      pincode?: string;
      latitude?: number | null;
      longitude?: number | null;
      licenseNumber?: string;
      licensePhotoUrl?: string;
      aadhaarNumber?: string;
      aadhaarFrontUrl?: string;
      aadhaarBackUrl?: string;
      kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
      isVerified?: boolean;
      rejectionReason?: string;
    }
  ) {
    const { Prisma } = require('@prisma/client');
    return prisma.$transaction(async (tx) => {
      // 1. Update User basic info
      const userUpdateData: import('@prisma/client').Prisma.UserUpdateInput = {};
      if (data.name !== undefined) userUpdateData.name = data.name;
      if (data.phone !== undefined) userUpdateData.phone = data.phone;
      if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;
      if (data.passwordHash) userUpdateData.passwordHash = data.passwordHash;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      const existingUser = await tx.user.findUnique({
        where: { id: userId },
        include: { farmerProfile: true, transporterProfile: true },
      });

      if (!existingUser) return null;

      // 2. Update Profile by role
      if (existingUser.role === UserRole.FARMER) {
        await tx.farmerProfile.upsert({
          where: { userId },
          create: {
            userId,
            address: data.address ?? null,
            village: data.village ?? null,
            district: data.district ?? null,
            state: data.state ?? null,
            pincode: data.pincode ?? null,
            latitude: data.latitude !== undefined && data.latitude !== null ? new Prisma.Decimal(data.latitude) : null,
            longitude: data.longitude !== undefined && data.longitude !== null ? new Prisma.Decimal(data.longitude) : null,
          },
          update: {
            address: data.address !== undefined ? data.address : undefined,
            village: data.village !== undefined ? data.village : undefined,
            district: data.district !== undefined ? data.district : undefined,
            state: data.state !== undefined ? data.state : undefined,
            pincode: data.pincode !== undefined ? data.pincode : undefined,
            latitude: data.latitude !== undefined ? (data.latitude !== null ? new Prisma.Decimal(data.latitude) : null) : undefined,
            longitude: data.longitude !== undefined ? (data.longitude !== null ? new Prisma.Decimal(data.longitude) : null) : undefined,
          },
        });
      } else if (existingUser.role === UserRole.TRANSPORTER) {
        const isVerifiedUpdate = data.isVerified !== undefined ? data.isVerified : (data.kycStatus === 'APPROVED' ? true : (data.kycStatus === 'REJECTED' ? false : undefined));
        const verifiedAtUpdate = isVerifiedUpdate ? new Date() : (data.kycStatus === 'REJECTED' ? null : undefined);

        await tx.transporterProfile.upsert({
          where: { userId },
          create: {
            userId,
            licenseNumber: data.licenseNumber ?? null,
            licensePhotoUrl: data.licensePhotoUrl ?? null,
            aadhaarNumber: data.aadhaarNumber ?? null,
            aadhaarFrontUrl: data.aadhaarFrontUrl ?? null,
            aadhaarBackUrl: data.aadhaarBackUrl ?? null,
            kycStatus: data.kycStatus ?? 'PENDING',
            isVerified: isVerifiedUpdate ?? false,
            rejectionReason: data.rejectionReason ?? null,
            verifiedAt: verifiedAtUpdate,
            address: data.address ?? null,
            latitude: data.latitude !== undefined && data.latitude !== null ? new Prisma.Decimal(data.latitude) : null,
            longitude: data.longitude !== undefined && data.longitude !== null ? new Prisma.Decimal(data.longitude) : null,
          },
          update: {
            licenseNumber: data.licenseNumber !== undefined ? data.licenseNumber : undefined,
            licensePhotoUrl: data.licensePhotoUrl !== undefined ? data.licensePhotoUrl : undefined,
            aadhaarNumber: data.aadhaarNumber !== undefined ? data.aadhaarNumber : undefined,
            aadhaarFrontUrl: data.aadhaarFrontUrl !== undefined ? data.aadhaarFrontUrl : undefined,
            aadhaarBackUrl: data.aadhaarBackUrl !== undefined ? data.aadhaarBackUrl : undefined,
            kycStatus: data.kycStatus !== undefined ? data.kycStatus : undefined,
            isVerified: isVerifiedUpdate !== undefined ? isVerifiedUpdate : undefined,
            rejectionReason: data.rejectionReason !== undefined ? data.rejectionReason : undefined,
            verifiedAt: verifiedAtUpdate !== undefined ? verifiedAtUpdate : undefined,
            address: data.address !== undefined ? data.address : undefined,
            latitude: data.latitude !== undefined ? (data.latitude !== null ? new Prisma.Decimal(data.latitude) : null) : undefined,
            longitude: data.longitude !== undefined ? (data.longitude !== null ? new Prisma.Decimal(data.longitude) : null) : undefined,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: { farmerProfile: true, transporterProfile: { include: { vehicles: true } } },
      });
    });
  }

  async addVehicle(transporterProfileId: string, vehicle: {
    registrationNumber: string;
    vehicleType: string;
    capacityTonnes: number;
  }) {
    return prisma.vehicle.create({
      data: {
        transporterProfileId,
        registrationNumber: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        capacityTonnes: vehicle.capacityTonnes,
        isActive: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async getVehicleRateCards() {
    return prisma.vehicleRateCard.findMany({
      orderBy: { capacityMinQtl: 'asc' },
    });
  }

  async upsertVehicleRateCard(data: {
    category: string;
    displayName: string;
    capacityMinQtl: number;
    capacityMaxQtl: number;
    basicFreight: number;
    ratePerKm: number;
    platformFeePct?: number;
  }) {
    return prisma.vehicleRateCard.upsert({
      where: { category: data.category },
      update: {
        displayName: data.displayName,
        capacityMinQtl: new Prisma.Decimal(data.capacityMinQtl),
        capacityMaxQtl: new Prisma.Decimal(data.capacityMaxQtl),
        basicFreight: new Prisma.Decimal(data.basicFreight),
        ratePerKm: new Prisma.Decimal(data.ratePerKm),
        platformFeePct: data.platformFeePct !== undefined ? new Prisma.Decimal(data.platformFeePct) : undefined,
      },
      create: {
        category: data.category,
        displayName: data.displayName,
        capacityMinQtl: new Prisma.Decimal(data.capacityMinQtl),
        capacityMaxQtl: new Prisma.Decimal(data.capacityMaxQtl),
        basicFreight: new Prisma.Decimal(data.basicFreight),
        ratePerKm: new Prisma.Decimal(data.ratePerKm),
        platformFeePct: data.platformFeePct !== undefined ? new Prisma.Decimal(data.platformFeePct) : new Prisma.Decimal(15),
      },
    });
  }
}
