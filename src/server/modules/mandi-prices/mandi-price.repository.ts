import prisma from '../../database/database';
import { CreateMandiPriceInput, UpdateMandiPriceInput, MandiPriceQueryInput } from './mandi-price.schema';
import { Prisma, UserRole } from '@prisma/client';

export class MandiPriceRepository {
  async createMandiPrice(adminId: string, input: CreateMandiPriceInput) {
    const calculatedPrice = input.price
      ? new Prisma.Decimal(input.price)
      : input.grades && input.grades.length > 0
      ? new Prisma.Decimal(
          (
            input.grades.reduce((acc, g) => acc + (g.minPrice + g.maxPrice) / 2, 0) /
            input.grades.length
          ).toFixed(2)
        )
      : new Prisma.Decimal(0);

    return prisma.$transaction(async (tx) => {
      const mandiPrice = await tx.mandiPrice.create({
        data: {
          mandiName: input.mandiName,
          productName: input.productName,
          price: calculatedPrice,
          unit: input.unit,
          adminId,
          grades: {
            create: input.grades.map((g) => ({
              gradeName: g.gradeName,
              minPrice: new Prisma.Decimal(g.minPrice),
              maxPrice: new Prisma.Decimal(g.maxPrice),
            })),
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: UserRole.ADMIN,
          entityType: 'MANDI_PRICE',
          entityId: mandiPrice.id,
          action: 'CREATE',
          newValue: {
            mandiName: input.mandiName,
            productName: input.productName,
            unit: input.unit,
            grades: input.grades,
          },
        },
      });

      return tx.mandiPrice.findUnique({
        where: { id: mandiPrice.id },
        include: {
          admin: { select: { id: true, name: true } },
          grades: { orderBy: { minPrice: 'desc' } },
        },
      });
    });
  }

  async findMandiPrices(query: MandiPriceQueryInput) {
    const where: Prisma.MandiPriceWhereInput = {
      isActive: true,
    };

    if (query.mandiName) {
      where.mandiName = { contains: query.mandiName, mode: 'insensitive' };
    }

    if (query.productName) {
      where.productName = { contains: query.productName, mode: 'insensitive' };
    }

    const skip = (query.page - 1) * query.limit;

    const [total, mandiPrices] = await Promise.all([
      prisma.mandiPrice.count({ where }),
      prisma.mandiPrice.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        include: {
          admin: { select: { id: true, name: true } },
          grades: { orderBy: { minPrice: 'desc' } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: mandiPrices,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async findMandiPriceById(id: string) {
    return prisma.mandiPrice.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, name: true } },
        grades: { orderBy: { minPrice: 'desc' } },
      },
    });
  }

  async updateMandiPrice(id: string, adminId: string, input: UpdateMandiPriceInput) {
    const data: Prisma.MandiPriceUpdateInput = {};
    if (input.mandiName !== undefined) data.mandiName = input.mandiName;
    if (input.productName !== undefined) data.productName = input.productName;
    if (input.price !== undefined) data.price = new Prisma.Decimal(input.price);
    if (input.unit !== undefined) data.unit = input.unit;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    return prisma.$transaction(async (tx) => {
      // If grades array provided, replace existing grades
      if (input.grades && input.grades.length > 0) {
        await tx.mandiPriceGrade.deleteMany({
          where: { mandiPriceId: id },
        });

        await tx.mandiPriceGrade.createMany({
          data: input.grades.map((g) => ({
            mandiPriceId: id,
            gradeName: g.gradeName,
            minPrice: new Prisma.Decimal(g.minPrice),
            maxPrice: new Prisma.Decimal(g.maxPrice),
          })),
        });

        // Update reference price if not explicitly provided
        if (input.price === undefined) {
          const avgPrice = new Prisma.Decimal(
            (
              input.grades.reduce((acc, g) => acc + (g.minPrice + g.maxPrice) / 2, 0) /
              input.grades.length
            ).toFixed(2)
          );
          data.price = avgPrice;
        }
      }

      await tx.mandiPrice.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: UserRole.ADMIN,
          entityType: 'MANDI_PRICE',
          entityId: id,
          action: 'UPDATE',
          newValue: input,
        },
      });

      return tx.mandiPrice.findUnique({
        where: { id },
        include: {
          admin: { select: { id: true, name: true } },
          grades: { orderBy: { minPrice: 'desc' } },
        },
      });
    });
  }

  async deleteMandiPrice(id: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.mandiPrice.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: UserRole.ADMIN,
          entityType: 'MANDI_PRICE',
          entityId: id,
          action: 'DEACTIVATE',
          newValue: { isActive: false },
        },
      });

      return deleted;
    });
  }
}

