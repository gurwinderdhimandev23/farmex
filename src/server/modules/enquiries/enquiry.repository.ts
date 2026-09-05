import prisma from '../../database/database';
import { CreateEnquiryInput, EnquiryQueryInput } from './enquiry.schema';
import { EnquiryStatus, UserRole, Prisma, SampleStatus } from '@prisma/client';

export class EnquiryRepository {
  private generateEnquiryNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `ENQ-${dateStr}-${randomSuffix}`;
  }

  async createEnquiry(farmerId: string, input: CreateEnquiryInput) {
    const enquiryNumber = this.generateEnquiryNumber();

    let pickupDateObj: Date;
    try {
      pickupDateObj = new Date(input.pickupDate);
      if (isNaN(pickupDateObj.getTime())) pickupDateObj = new Date();
    } catch {
      pickupDateObj = new Date();
    }

    let sampleDateObj: Date | null = null;
    if (input.samplePreferredDate) {
      try {
        const d = new Date(input.samplePreferredDate);
        if (!isNaN(d.getTime())) sampleDateObj = d;
      } catch {
        sampleDateObj = null;
      }
    }

    return prisma.$transaction(async (tx) => {
      const enquiry = await tx.enquiry.create({
        data: {
          enquiryNumber,
          farmerId,
          pickupLocation: input.pickupLocation,
          pickupLatitude: input.pickupLatitude !== undefined && input.pickupLatitude !== null ? new Prisma.Decimal(input.pickupLatitude) : null,
          pickupLongitude: input.pickupLongitude !== undefined && input.pickupLongitude !== null ? new Prisma.Decimal(input.pickupLongitude) : null,
          destinationLocation: input.destinationLocation,
          destinationLatitude: input.destinationLatitude !== undefined && input.destinationLatitude !== null ? new Prisma.Decimal(input.destinationLatitude) : null,
          destinationLongitude: input.destinationLongitude !== undefined && input.destinationLongitude !== null ? new Prisma.Decimal(input.destinationLongitude) : null,
          materialName: input.materialName,
          quantityKg: new Prisma.Decimal(input.quantityKg),
          vehicleTypeId: input.vehicleTypeId && input.vehicleTypeId.trim().length > 0 ? input.vehicleTypeId.trim() : null,
          vehicleRequirement: input.vehicleRequirement ? input.vehicleRequirement.trim() : null,
          pickupDate: pickupDateObj,
          preferredTimeSlot: input.preferredTimeSlot ? input.preferredTimeSlot.trim() : null,
          labourRequired: Boolean(input.labourRequired),
          notes: input.notes ? input.notes.trim() : null,
          isReturnLoad: Boolean(input.isReturnLoad),
          isSellFromFarm: Boolean(input.isSellFromFarm),
          sampleStatus: input.isSellFromFarm ? SampleStatus.PENDING_COLLECTION : null,
          samplePreferredDate: sampleDateObj,
          samplePreferredSlot: input.samplePreferredSlot ? input.samplePreferredSlot.trim() : null,
          distanceFromRewariKm: input.distanceFromRewariKm !== undefined && input.distanceFromRewariKm !== null ? new Prisma.Decimal(input.distanceFromRewariKm) : null,
          status: EnquiryStatus.SUBMITTED,
        },
      });

      // Create requested labour items safely if provided
      if (input.labourRequired && input.labourItems && input.labourItems.length > 0) {
        const requestedIds = input.labourItems.map((item) => item.labourTypeId);
        const validTypes = await tx.labourType.findMany({
          where: { id: { in: requestedIds } },
          select: { id: true },
        });
        const validIdSet = new Set(validTypes.map((t) => t.id));
        const validItems = input.labourItems.filter((item) => validIdSet.has(item.labourTypeId));

        if (validItems.length > 0) {
          await tx.enquiryLabour.createMany({
            data: validItems.map((item) => ({
              enquiryId: enquiry.id,
              labourTypeId: item.labourTypeId,
              quantity: item.quantity,
              notes: item.notes ?? null,
            })),
          });
        }
      }

      // Initial Status History Log
      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId: enquiry.id,
          toStatus: EnquiryStatus.SUBMITTED,
          actorId: farmerId,
          actorRole: UserRole.FARMER,
          notes: 'Enquiry created by farmer',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: farmerId,
          actorRole: UserRole.FARMER,
          entityType: 'ENQUIRY',
          entityId: enquiry.id,
          action: 'CREATE',
          newValue: { enquiryNumber: enquiry.enquiryNumber, status: enquiry.status },
        },
      });

      return tx.enquiry.findUnique({
        where: { id: enquiry.id },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
              farmerProfile: true,
            },
          },
          enquiryLabours: {
            include: {
              labourType: true,
            },
          },
          transportPricing: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async findEnquiryById(id: string) {
    return prisma.enquiry.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            farmerProfile: true,
          },
        },
        enquiryLabours: {
          include: {
            labourType: true,
            labourPricing: true,
          },
        },
        transportPricing: true,
        assignments: {
          include: {
            transporter: {
              select: {
                id: true,
                name: true,
                phone: true,
                transporterProfile: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        trips: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findEnquiries(query: EnquiryQueryInput) {
    const where: Prisma.EnquiryWhereInput = {
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.farmerId) {
      where.farmerId = query.farmerId;
    }

    if (query.isReturnLoad !== undefined) {
      where.isReturnLoad = query.isReturnLoad;
    }

    const skip = (query.page - 1) * query.limit;

    const [total, enquiries] = await Promise.all([
      prisma.enquiry.count({ where }),
      prisma.enquiry.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
              farmerProfile: true,
            },
          },
          enquiryLabours: {
            include: {
              labourType: true,
            },
          },
          transportPricing: true,
          assignments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              transporter: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
            },
          },
          trips: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              transporter: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                },
              },
              vehicle: true,
            },
          },
        },
      }),
    ]);


    const totalPages = Math.ceil(total / query.limit);

    return {
      data: enquiries,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async updateEnquiryStatus(
    enquiryId: string,
    fromStatus: EnquiryStatus,
    toStatus: EnquiryStatus,
    actorId: string,
    actorRole: UserRole,
    notes?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedEnquiry = await tx.enquiry.update({
        where: { id: enquiryId },
        data: { status: toStatus },
      });

      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId,
          fromStatus,
          toStatus,
          actorId,
          actorRole,
          notes: notes ?? null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          actorRole,
          entityType: 'ENQUIRY',
          entityId: enquiryId,
          action: 'UPDATE_STATUS',
          oldValue: { status: fromStatus },
          newValue: { status: toStatus, notes },
        },
      });

      return tx.enquiry.findUnique({
        where: { id: enquiryId },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          enquiryLabours: {
            include: {
              labourType: true,
            },
          },
          transportPricing: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async softDeleteEnquiry(id: string, actorId: string, actorRole: UserRole) {
    return prisma.$transaction(async (tx) => {
      const enquiry = await tx.enquiry.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          actorRole,
          entityType: 'ENQUIRY',
          entityId: id,
          action: 'DELETE',
          oldValue: { deletedAt: null },
          newValue: { deletedAt: enquiry.deletedAt },
        },
      });

      return enquiry;
    });
  }

  async updateSampleWorkflow(
    enquiryId: string,
    sampleData: {
      sampleStatus: import('@prisma/client').SampleStatus;
      sampleCollectorNotes?: string;
      labReportImageUrl?: string;
      labRemarks?: string;
      quotedPricePerQtl?: number;
      distanceFromRewariKm?: number;
    },
    actorId: string,
    actorRole: UserRole
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.enquiry.findUnique({ where: { id: enquiryId } });
      if (!existing) throw new Error('Enquiry not found');

      const updatePayload: Prisma.EnquiryUpdateInput = {
        sampleStatus: sampleData.sampleStatus,
      };

      if (sampleData.sampleStatus === 'SAMPLE_COLLECTED') {
        updatePayload.sampleCollectedAt = new Date();
      }
      if (sampleData.sampleCollectorNotes !== undefined) {
        updatePayload.sampleCollectorNotes = sampleData.sampleCollectorNotes;
      }
      if (sampleData.labReportImageUrl !== undefined) {
        updatePayload.labReportImageUrl = sampleData.labReportImageUrl;
      }
      if (sampleData.labRemarks !== undefined) {
        updatePayload.labRemarks = sampleData.labRemarks;
      }
      if (sampleData.quotedPricePerQtl !== undefined) {
        updatePayload.quotedPricePerQtl = new Prisma.Decimal(sampleData.quotedPricePerQtl);
      }
      if (sampleData.distanceFromRewariKm !== undefined) {
        updatePayload.distanceFromRewariKm = new Prisma.Decimal(sampleData.distanceFromRewariKm);
      }

      // If approved or rejected, sync enquiry status appropriately
      if (sampleData.sampleStatus === 'APPROVED' && existing.status === EnquiryStatus.SUBMITTED) {
        updatePayload.status = EnquiryStatus.ADMIN_ACCEPTED;
      }

      const updated = await tx.enquiry.update({
        where: { id: enquiryId },
        data: updatePayload,
        include: {
          farmer: true,
          transportPricing: true,
        },
      });

      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId,
          toStatus: updated.status,
          actorId,
          actorRole,
          notes: `Sample Status: ${sampleData.sampleStatus}${sampleData.labRemarks ? ` | Remarks: ${sampleData.labRemarks}` : ''}${sampleData.quotedPricePerQtl ? ` | Price: ₹${sampleData.quotedPricePerQtl}/Qtl` : ''}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          actorRole,
          entityType: 'ENQUIRY',
          entityId: enquiryId,
          action: `SAMPLE_${sampleData.sampleStatus}`,
          oldValue: { sampleStatus: existing.sampleStatus },
          newValue: { sampleStatus: updated.sampleStatus, labRemarks: updated.labRemarks },
        },
      });

      return updated;
    });
  }
}
