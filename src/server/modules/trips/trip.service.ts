import { TripRepository } from './trip.repository';
import { AssignTransporterInput, RespondAssignmentInput, UpdateTripStatusInput, TripQueryInput } from './trip.schema';
import { EnquiryRepository } from '../enquiries/enquiry.repository';
import { AuthRepository } from '../auth/auth.repository';
import { TripStatus, EnquiryStatus, AssignmentStatus, UserRole } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError } from '../../shared/errors/app-error';
import {
  notifyTransporterTripAssigned,
  notifyFarmerTripAssigned,
  notifyFarmerTripStatusUpdate,
  notifyTransporterTripCompleted,
} from '../../shared/notifications/whatsapp.service';

export class TripService {
  private tripRepository: TripRepository;
  private enquiryRepository: EnquiryRepository;
  private authRepository: AuthRepository;

  constructor(
    tripRepository = new TripRepository(),
    enquiryRepository = new EnquiryRepository(),
    authRepository = new AuthRepository()
  ) {
    this.tripRepository = tripRepository;
    this.enquiryRepository = enquiryRepository;
    this.authRepository = authRepository;
  }

  async assignTransporter(adminId: string, input: AssignTransporterInput) {
    const enquiry = await this.enquiryRepository.findEnquiryById(input.enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    if (
      enquiry.status !== EnquiryStatus.ADMIN_ACCEPTED &&
      enquiry.status !== EnquiryStatus.TRANSPORTER_REJECTED
    ) {
      throw new ConflictError(
        `Cannot assign transporter for enquiry with status '${enquiry.status}'. Enquiry must be accepted by Admin.`
      );
    }

    const transporter = await this.authRepository.findUserById(input.transporterId);
    if (!transporter || transporter.role !== UserRole.TRANSPORTER || !transporter.isActive) {
      throw new NotFoundError('Transporter user not found or inactive');
    }

    if (!transporter.transporterProfile?.isVerified) {
      throw new ConflictError('Cannot assign trips to an unverified transporter. Please approve driver KYC in User Management first.');
    }

    const trip = await this.tripRepository.assignTransporter(adminId, input);

    if (trip) {
      // 1. WhatsApp Alert to Transporter (New Lead Assigned)
      notifyTransporterTripAssigned({
        transporterPhone: trip.transporter.phone,
        transporterName: trip.transporter.name,
        farmerName: trip.enquiry.farmer.name,
        farmerPhone: trip.enquiry.farmer.phone,
        pickupLocation: trip.enquiry.pickupLocation,
        destinationLocation: trip.enquiry.destinationLocation,
        materialName: trip.enquiry.materialName,
        quantityKg: trip.enquiry.quantityKg ? Number(trip.enquiry.quantityKg) : null,
        tripNumber: trip.tripNumber,
        tripId: trip.id,
      }).catch((err) => console.warn('[WHATSAPP_DISPATCH_WARN]', err));

      // 2. WhatsApp Alert to Farmer (Transporter Assigned with Tracking Link)
      notifyFarmerTripAssigned({
        farmerPhone: trip.enquiry.farmer.phone,
        farmerName: trip.enquiry.farmer.name,
        transporterName: trip.transporter.name,
        transporterPhone: trip.transporter.phone,
        pickupLocation: trip.enquiry.pickupLocation,
        destinationLocation: trip.enquiry.destinationLocation,
        tripNumber: trip.tripNumber,
        tripId: trip.id,
      }).catch((err) => console.warn('[WHATSAPP_DISPATCH_WARN]', err));
    }

    return trip;
  }

  async respondAssignment(tripId: string, transporterId: string, input: RespondAssignmentInput) {
    const trip = await this.tripRepository.findTripById(tripId);
    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    // Ownership Check
    if (trip.transporterId !== transporterId) {
      throw new AuthorizationError('You are not authorized to respond to this trip assignment');
    }

    // State Machine Check
    if (trip.status !== TripStatus.ASSIGNED) {
      throw new ConflictError(`Cannot respond to assignment with trip status '${trip.status}'`);
    }

    return this.tripRepository.respondAssignment(tripId, transporterId, input);
  }

  async updateTripStatus(tripId: string, transporterId: string, input: UpdateTripStatusInput) {
    const trip = await this.tripRepository.findTripById(tripId);
    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    // Ownership Check
    if (trip.transporterId !== transporterId) {
      throw new AuthorizationError('You are not authorized to update status for this trip');
    }

    // State Machine Transition Rules
    const currentStatus = trip.status;
    const targetStatus = input.status;

    const allowedTransitions: Record<TripStatus, TripStatus[]> = {
      [TripStatus.ASSIGNED]: [TripStatus.ACCEPTED, TripStatus.PICKUP, TripStatus.CANCELLED],
      [TripStatus.ACCEPTED]: [TripStatus.PICKUP, TripStatus.CANCELLED],
      [TripStatus.PICKUP]: [TripStatus.IN_TRANSIT],
      [TripStatus.IN_TRANSIT]: [TripStatus.ON_DESTINATION],
      [TripStatus.ON_DESTINATION]: [TripStatus.DELIVERED],
      [TripStatus.DELIVERED]: [],
      [TripStatus.CANCELLED]: [],
    };

    const validNextStatuses = allowedTransitions[currentStatus] || [];
    if (!validNextStatuses.includes(targetStatus)) {
      throw new ConflictError(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'.`
      );
    }

    const updatedTrip = await this.tripRepository.updateTripStatus(tripId, transporterId, input);

    if (updatedTrip) {
      // 1. Live Tracking WhatsApp Updates to Farmer (PICKUP, IN_TRANSIT, ON_DESTINATION, DELIVERED)
      if (
        input.status === TripStatus.PICKUP ||
        input.status === TripStatus.IN_TRANSIT ||
        input.status === TripStatus.ON_DESTINATION ||
        input.status === TripStatus.DELIVERED
      ) {
        notifyFarmerTripStatusUpdate({
          farmerPhone: updatedTrip.enquiry.farmer.phone,
          farmerName: updatedTrip.enquiry.farmer.name,
          transporterName: updatedTrip.transporter.name,
          status: input.status,
          destinationLocation: updatedTrip.enquiry.destinationLocation,
          tripNumber: updatedTrip.tripNumber,
          tripId: updatedTrip.id,
        }).catch((err) => console.warn('[WHATSAPP_DISPATCH_WARN]', err));
      }

      // 2. Thank You & Earnings WhatsApp to Transporter on Delivery
      if (input.status === TripStatus.DELIVERED) {
        notifyTransporterTripCompleted({
          transporterPhone: updatedTrip.transporter.phone,
          transporterName: updatedTrip.transporter.name,
          tripNumber: updatedTrip.tripNumber,
          destinationLocation: updatedTrip.enquiry.destinationLocation,
        }).catch((err) => console.warn('[WHATSAPP_DISPATCH_WARN]', err));
      }
    }

    return updatedTrip;
  }

  async getTripById(id: string, userId: string, userRole: UserRole) {
    const trip = await this.tripRepository.findTripById(id);
    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    // Ownership & Scope Authorization
    if (userRole === UserRole.TRANSPORTER && trip.transporterId !== userId) {
      throw new AuthorizationError('You do not have permission to view this trip');
    }
    if (userRole === UserRole.FARMER && trip.enquiry.farmerId !== userId) {
      throw new AuthorizationError('You do not have permission to view this trip');
    }

    return trip;
  }

  async getTransporterRequests(transporterId: string, query: TripQueryInput) {
    return this.tripRepository.findTrips({
      ...query,
      transporterId,
      status: TripStatus.ASSIGNED,
    });
  }

  async getTransporterActiveTrips(transporterId: string, query: TripQueryInput) {
    return this.tripRepository.findTrips({
      ...query,
      transporterId,
    });
  }

  async getAllTripsAdmin(query: TripQueryInput) {
    return this.tripRepository.findTrips(query);
  }
}
