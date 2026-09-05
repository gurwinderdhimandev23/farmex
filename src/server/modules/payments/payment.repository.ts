import prisma from '../../database/database';
import { RecordCashPaymentInput, PaymentQueryInput } from './payment.schema';
import { PaymentMethod, PaymentStatus, EnquiryStatus, UserRole, NotificationType, Prisma } from '@prisma/client';

export class PaymentRepository {
  private generateReceiptNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `PAY-${dateStr}-${randomSuffix}`;
  }

  async findPaymentByIdempotencyKey(idempotencyKey: string) {
    return prisma.payment.findUnique({
      where: { idempotencyKey },
    });
  }

  async recordCashPayment(recordedById: string, recordedByRole: UserRole, input: RecordCashPaymentInput) {
    const receiptNumber = this.generateReceiptNumber();
    const amountDec = new Prisma.Decimal(input.amount);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          enquiryId: input.enquiryId,
          tripId: input.tripId ?? null,
          amount: amountDec,
          paymentMethod: PaymentMethod.CASH,
          paymentStatus: PaymentStatus.PAID,
          transactionId: input.transactionId ?? null,
          idempotencyKey: input.idempotencyKey,
          paidAt: now,
          recordedBy: recordedById,
          notes: input.notes ?? null,
        },
      });

      // 2. Update Enquiry Status to PAYMENT_COMPLETED
      const enquiry = await tx.enquiry.update({
        where: { id: input.enquiryId },
        data: { status: EnquiryStatus.PAYMENT_COMPLETED },
      });

      // 3. Status History & Audit Log
      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId: input.enquiryId,
          fromStatus: EnquiryStatus.DELIVERED,
          toStatus: EnquiryStatus.PAYMENT_COMPLETED,
          actorId: recordedById,
          actorRole: recordedByRole,
          notes: `Cash payment recorded (${receiptNumber})`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: recordedById,
          actorRole: recordedByRole,
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'RECORD_CASH_PAYMENT',
          newValue: { receiptNumber, amount: input.amount, enquiryId: input.enquiryId },
        },
      });

      // 4. Notification to Farmer
      await tx.notification.create({
        data: {
          userId: enquiry.farmerId,
          title: 'Payment Received',
          message: `Cash payment of ₹${input.amount} for enquiry (${enquiry.enquiryNumber}) has been confirmed. Receipt: ${receiptNumber}.`,
          type: NotificationType.PAYMENT_RECEIVED,
          metadata: { paymentId: payment.id, receiptNumber },
        },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          enquiry: {
            include: {
              farmer: { select: { id: true, name: true, phone: true } },
              transportPricing: true,
            },
          },
        },
      });
    });
  }

  async findPaymentByEnquiryId(enquiryId: string) {
    return prisma.payment.findFirst({
      where: { enquiryId },
      include: {
        enquiry: {
          include: {
            farmer: { select: { id: true, name: true, phone: true } },
            transportPricing: true,
          },
        },
      },
    });
  }

  async findPayments(query: PaymentQueryInput) {
    const where: Prisma.PaymentWhereInput = {};

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    if (query.enquiryId) {
      where.enquiryId = query.enquiryId;
    }

    const skip = (query.page - 1) * query.limit;

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        include: {
          enquiry: {
            include: {
              farmer: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: payments,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async getTransporterEarningsSummary(transporterId: string) {
    const result = await prisma.payment.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
        OR: [
          { recordedBy: transporterId },
          { trip: { transporterId } },
          {
            enquiry: {
              assignments: {
                some: {
                  transporterId,
                },
              },
            },
          },
        ],
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalEarnings: result._sum.amount ? result._sum.amount.toNumber() : 0,
      totalPaidTrips: result._count.id,
      totalEarningsCash: result._sum.amount ? result._sum.amount.toNumber() : 0,
      totalTripsCompleted: result._count.id,
    };
  }
}
