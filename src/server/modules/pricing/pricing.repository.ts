import prisma from '../../database/database';
import { CreateLabourTypeInput, UpdateLabourTypeInput, SetEnquiryPricingInput } from './pricing.schema';
import { Prisma, UserRole } from '@prisma/client';

export class PricingRepository {
  async createLabourType(input: CreateLabourTypeInput) {
    return prisma.labourType.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        basePrice: new Prisma.Decimal(input.basePrice),
      },
    });
  }

  async findLabourTypes(activeOnly = true) {
    const where: Prisma.LabourTypeWhereInput = activeOnly ? { isActive: true } : {};
    return prisma.labourType.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findLabourTypeById(id: string) {
    return prisma.labourType.findUnique({
      where: { id },
    });
  }

  async updateLabourType(id: string, input: UpdateLabourTypeInput) {
    const data: Prisma.LabourTypeUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.basePrice !== undefined) data.basePrice = new Prisma.Decimal(input.basePrice);
    if (input.isActive !== undefined) data.isActive = input.isActive;

    return prisma.labourType.update({
      where: { id },
      data,
    });
  }

  async setEnquiryPricing(enquiryId: string, adminId: string, input: SetEnquiryPricingInput) {
    const transportPriceDec = new Prisma.Decimal(input.transportPrice);
    const labourPriceDec = new Prisma.Decimal(input.labourPrice);
    const totalAmountDec = transportPriceDec.add(labourPriceDec);

    return prisma.$transaction(async (tx) => {
      // 1. Upsert Transport Pricing
      const transportPricing = await tx.transportPricing.upsert({
        where: { enquiryId },
        create: {
          enquiryId,
          adminId,
          transportPrice: transportPriceDec,
          labourPrice: labourPriceDec,
          totalAmount: totalAmountDec,
          notes: input.notes ?? null,
        },
        update: {
          adminId,
          transportPrice: transportPriceDec,
          labourPrice: labourPriceDec,
          totalAmount: totalAmountDec,
          notes: input.notes ?? null,
        },
      });

      // 2. Set Labour Item Pricings if provided
      if (input.labourItemPricings && input.labourItemPricings.length > 0) {
        for (const item of input.labourItemPricings) {
          const enquiryLabour = await tx.enquiryLabour.findUnique({
            where: { id: item.enquiryLabourId },
          });

          if (enquiryLabour) {
            const unitPriceDec = new Prisma.Decimal(item.unitPrice);
            const totalLabourPriceDec = unitPriceDec.mul(enquiryLabour.quantity);

            await tx.labourPricing.upsert({
              where: { enquiryLabourId: item.enquiryLabourId },
              create: {
                enquiryLabourId: item.enquiryLabourId,
                labourTypeId: enquiryLabour.labourTypeId,
                adminId,
                unitPrice: unitPriceDec,
                totalLabourPrice: totalLabourPriceDec,
              },
              update: {
                adminId,
                unitPrice: unitPriceDec,
                totalLabourPrice: totalLabourPriceDec,
              },
            });
          }
        }
      }

      // 3. Log Audit Log
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: UserRole.ADMIN,
          entityType: 'PRICING',
          entityId: enquiryId,
          action: 'SET_PRICE',
          newValue: {
            transportPrice: input.transportPrice,
            labourPrice: input.labourPrice,
            totalAmount: totalAmountDec.toNumber(),
          },
        },
      });

      return tx.transportPricing.findUnique({
        where: { enquiryId },
        include: {
          enquiry: {
            include: {
              enquiryLabours: {
                include: {
                  labourType: true,
                  labourPricing: true,
                },
              },
            },
          },
          admin: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
    });
  }

  async findPricingByEnquiryId(enquiryId: string) {
    return prisma.transportPricing.findUnique({
      where: { enquiryId },
      include: {
        enquiry: {
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
                labourPricing: true,
              },
            },
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }
}
