import prisma from '../../database/database';
import { AssignTransporterInput, RespondAssignmentInput, UpdateTripStatusInput, TripQueryInput } from './trip.schema';
import { TripStatus, EnquiryStatus, AssignmentStatus, TransporterStatus, UserRole, NotificationType, Prisma } from '@prisma/client';

export class TripRepository {
  private generateTripNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `TRIP-${dateStr}-${randomSuffix}`;
  }

  async assignTransporter(adminId: string, input: AssignTransporterInput) {
    const tripNumber = this.generateTripNumber();

    return prisma.$transaction(async (tx) => {
      // 1. Create Transport Assignment
      const assignment = await tx.transportAssignment.create({
        data: {
          enquiryId: input.enquiryId,
          transporterId: input.transporterId,
          status: AssignmentStatus.PENDING,
        },
      });

      // 2. Create Trip
      const trip = await tx.trip.create({
        data: {
          tripNumber,
          enquiryId: input.enquiryId,
          transporterId: input.transporterId,
          vehicleId: input.vehicleId ?? null,
          status: TripStatus.ASSIGNED,
          notes: input.notes ?? null,
        },
      });

      // 3. Update Enquiry Status
      await tx.enquiry.update({
        where: { id: input.enquiryId },
        data: { status: EnquiryStatus.TRANSPORTER_ASSIGNED },
      });

      // 4. Status History & Audit Log
      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId: input.enquiryId,
          fromStatus: EnquiryStatus.ADMIN_ACCEPTED,
          toStatus: EnquiryStatus.TRANSPORTER_ASSIGNED,
          actorId: adminId,
          actorRole: UserRole.ADMIN,
          notes: `Transporter assigned (Trip: ${trip.tripNumber})`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorRole: UserRole.ADMIN,
          entityType: 'TRIP',
          entityId: trip.id,
          action: 'ASSIGN_TRANSPORTER',
          newValue: { transporterId: input.transporterId, enquiryId: input.enquiryId, tripNumber },
        },
      });

      // 5. In-app Notification for Transporter
      await tx.notification.create({
        data: {
          userId: input.transporterId,
          title: 'New Pickup Request Assigned',
          message: `You have been assigned a new pickup request (${tripNumber}). Please review and accept.`,
          type: NotificationType.TRIP_ASSIGNED,
          metadata: { tripId: trip.id, enquiryId: input.enquiryId },
        },
      });

      return tx.trip.findUnique({
        where: { id: trip.id },
        include: {
          enquiry: {
            include: {
              farmer: {
                select: { id: true, name: true, phone: true },
              },
              transportPricing: true,
            },
          },
          transporter: {
            select: { id: true, name: true, phone: true, transporterProfile: true },
          },
        },
      });
    });
  }

  async respondAssignment(tripId: string, transporterId: string, input: RespondAssignmentInput) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { enquiry: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      const isAccepted = input.status === AssignmentStatus.ACCEPTED;
      const newTripStatus = isAccepted ? TripStatus.ACCEPTED : TripStatus.CANCELLED;
      const newEnquiryStatus = isAccepted ? EnquiryStatus.TRANSPORTER_ACCEPTED : EnquiryStatus.TRANSPORTER_REJECTED;

      // 1. Update Trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: newTripStatus,
          vehicleId: input.vehicleId ?? trip.vehicleId,
        },
      });

      // 2. Update Transport Assignment
      await tx.transportAssignment.updateMany({
        where: { enquiryId: trip.enquiryId, transporterId, status: AssignmentStatus.PENDING },
        data: {
          status: input.status,
          respondedAt: new Date(),
          rejectionReason: input.rejectionReason ?? null,
        },
      });

      // 3. Update Enquiry Status
      await tx.enquiry.update({
        where: { id: trip.enquiryId },
        data: { status: newEnquiryStatus },
      });

      // 4. Update Transporter Profile Status if accepted
      if (isAccepted) {
        await tx.transporterProfile.updateMany({
          where: { userId: transporterId },
          data: { status: TransporterStatus.ON_TRIP },
        });
      }

      // 5. Status History & Audit Log
      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId: trip.enquiryId,
          fromStatus: EnquiryStatus.TRANSPORTER_ASSIGNED,
          toStatus: newEnquiryStatus,
          actorId: transporterId,
          actorRole: UserRole.TRANSPORTER,
          notes: isAccepted ? 'Transporter accepted assignment' : `Transporter rejected: ${input.rejectionReason ?? 'No reason given'}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: transporterId,
          actorRole: UserRole.TRANSPORTER,
          entityType: 'TRIP',
          entityId: tripId,
          action: isAccepted ? 'ACCEPT_ASSIGNMENT' : 'REJECT_ASSIGNMENT',
          oldValue: { status: trip.status },
          newValue: { status: newTripStatus, rejectionReason: input.rejectionReason },
        },
      });

      // 6. Notifications for Farmer
      await tx.notification.create({
        data: {
          userId: trip.enquiry.farmerId,
          title: isAccepted ? 'Transporter Accepted Pickup' : 'Transporter Rejected Assignment',
          message: isAccepted
            ? `Your transport request (${trip.enquiry.enquiryNumber}) has been accepted by the transporter.`
            : `Transporter rejected the assignment for enquiry (${trip.enquiry.enquiryNumber}). Admin will reassign.`,
          type: NotificationType.ENQUIRY_UPDATE,
          metadata: { tripId: trip.id, enquiryId: trip.enquiryId },
        },
      });

      return tx.trip.findUnique({
        where: { id: tripId },
        include: {
          enquiry: {
            include: {
              farmer: { select: { id: true, name: true, phone: true } },
              transportPricing: true,
            },
          },
          transporter: { select: { id: true, name: true, phone: true } },
        },
      });
    });
  }

  async updateTripStatus(tripId: string, transporterId: string, input: UpdateTripStatusInput) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { enquiry: true },
      });

      if (!trip) {
        throw new Error('Trip not found');
      }

      const now = new Date();
      const tripUpdateData: Prisma.TripUpdateInput = {
        status: input.status,
        notes: input.notes ?? trip.notes,
      };

      if (input.startOdometer !== undefined) {
        tripUpdateData.startOdometer = new Prisma.Decimal(input.startOdometer);
      }
      if (input.endOdometer !== undefined) {
        tripUpdateData.endOdometer = new Prisma.Decimal(input.endOdometer);
      }

      let targetEnquiryStatus: EnquiryStatus = EnquiryStatus.IN_TRANSIT;

      if (input.status === TripStatus.PICKUP) {
        tripUpdateData.pickupTime = now;
        targetEnquiryStatus = EnquiryStatus.PICKUP;

        // Set Transporter status to ON_TRIP
        await tx.transporterProfile.updateMany({
          where: { userId: transporterId },
          data: { status: TransporterStatus.ON_TRIP },
        });

        // Auto-accept pending assignment if advancing directly from ASSIGNED
        await tx.transportAssignment.updateMany({
          where: { enquiryId: trip.enquiryId, transporterId, status: AssignmentStatus.PENDING },
          data: { status: AssignmentStatus.ACCEPTED, respondedAt: now },
        });
      } else if (input.status === TripStatus.IN_TRANSIT) {
        tripUpdateData.inTransitTime = now;
        targetEnquiryStatus = EnquiryStatus.IN_TRANSIT;
      } else if (input.status === TripStatus.ON_DESTINATION) {
        tripUpdateData.destinationTime = now;
        targetEnquiryStatus = EnquiryStatus.ON_DESTINATION;
      } else if (input.status === TripStatus.DELIVERED) {
        tripUpdateData.deliveryTime = now;
        targetEnquiryStatus = EnquiryStatus.DELIVERED;

        // Reset Transporter status back to AVAILABLE upon delivery
        await tx.transporterProfile.updateMany({
          where: { userId: transporterId },
          data: { status: TransporterStatus.AVAILABLE },
        });
      }


      // 1. Update Trip
      await tx.trip.update({
        where: { id: tripId },
        data: tripUpdateData,
      });

      // 2. Update Enquiry Status
      await tx.enquiry.update({
        where: { id: trip.enquiryId },
        data: { status: targetEnquiryStatus },
      });

      // 3. Status History & Audit Log
      await tx.enquiryStatusHistory.create({
        data: {
          enquiryId: trip.enquiryId,
          fromStatus: trip.enquiry.status,
          toStatus: targetEnquiryStatus,
          actorId: transporterId,
          actorRole: UserRole.TRANSPORTER,
          notes: `Trip status updated to ${input.status}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: transporterId,
          actorRole: UserRole.TRANSPORTER,
          entityType: 'TRIP',
          entityId: tripId,
          action: 'UPDATE_TRIP_STATUS',
          oldValue: { status: trip.status },
          newValue: { status: input.status, notes: input.notes },
        },
      });

      // 4. Notification to Farmer
      await tx.notification.create({
        data: {
          userId: trip.enquiry.farmerId,
          title: `Trip Status Update: ${input.status}`,
          message: `Your consignment (${trip.enquiry.enquiryNumber}) status has been updated to ${input.status}.`,
          type: NotificationType.ENQUIRY_UPDATE,
          metadata: { tripId: trip.id, enquiryId: trip.enquiryId, status: input.status },
        },
      });

      return tx.trip.findUnique({
        where: { id: tripId },
        include: {
          enquiry: {
            include: {
              farmer: { select: { id: true, name: true, phone: true } },
              transportPricing: true,
              statusHistory: { orderBy: { createdAt: 'desc' } },
            },
          },
          transporter: { select: { id: true, name: true, phone: true } },
        },
      });
    });
  }

  async findTripById(id: string) {
    return prisma.trip.findUnique({
      where: { id },
      include: {
        enquiry: {
          include: {
            farmer: { select: { id: true, name: true, phone: true, farmerProfile: true } },
            transportPricing: true,
            enquiryLabours: { include: { labourType: true, labourPricing: true } },
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        },
        transporter: { select: { id: true, name: true, phone: true, transporterProfile: true } },
        vehicle: true,
        payments: true,
      },
    });
  }

  async findTrips(query: TripQueryInput) {
    const where: Prisma.TripWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.transporterId) {
      where.transporterId = query.transporterId;
    }

    if (query.enquiryId) {
      where.enquiryId = query.enquiryId;
    }

    const skip = (query.page - 1) * query.limit;

    const [total, trips] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
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
              transportPricing: true,
              payments: true,
            },
          },
          transporter: { select: { id: true, name: true, phone: true } },
          vehicle: true,
          payments: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return {
      data: trips,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }
}
