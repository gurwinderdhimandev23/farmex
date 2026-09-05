import { EnquiryRepository } from './enquiry.repository';
import { CreateEnquiryInput, EnquiryQueryInput, ReviewEnquiryInput, CancelEnquiryInput } from './enquiry.schema';
import { EnquiryStatus, UserRole } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError } from '../../shared/errors/app-error';

export class EnquiryService {
  private enquiryRepository: EnquiryRepository;

  constructor(enquiryRepository = new EnquiryRepository()) {
    this.enquiryRepository = enquiryRepository;
  }

  async createEnquiry(farmerId: string, input: CreateEnquiryInput) {
    // If distance from Rewari is not provided, calculate from pickup coordinates if available
    let distRewari = input.distanceFromRewariKm;
    if (distRewari === undefined && input.pickupLatitude && input.pickupLongitude) {
      const REWARI_LAT = 28.1920;
      const REWARI_LNG = 76.6191;
      const R = 6371; // Earth radius in KM
      const dLat = ((input.pickupLatitude - REWARI_LAT) * Math.PI) / 180;
      const dLon = ((input.pickupLongitude - REWARI_LNG) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((REWARI_LAT * Math.PI) / 180) *
          Math.cos((input.pickupLatitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distRewari = Math.round(R * c * 10) / 10; // 1 decimal place
    }

    const created = await this.enquiryRepository.createEnquiry(farmerId, {
      ...input,
      distanceFromRewariKm: distRewari,
    });

    return created;
  }

  async getMyEnquiries(farmerId: string, query: EnquiryQueryInput) {
    return this.enquiryRepository.findEnquiries({
      ...query,
      farmerId,
    });
  }

  async getEnquiryById(id: string, userId: string, userRole: UserRole) {
    const enquiry = await this.enquiryRepository.findEnquiryById(id);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Ownership & Scope Authorization Rule (AGENTS.md Section 15)
    if (userRole === UserRole.FARMER && enquiry.farmerId !== userId) {
      throw new AuthorizationError('You do not have permission to view this enquiry');
    }

    return enquiry;
  }

  async getAllEnquiriesAdmin(query: EnquiryQueryInput) {
    return this.enquiryRepository.findEnquiries(query);
  }

  async reviewEnquiryAdmin(enquiryId: string, adminId: string, input: ReviewEnquiryInput) {
    const enquiry = await this.enquiryRepository.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // State Machine Transition Rule: Admin can only review SUBMITTED enquiries
    if (enquiry.status !== EnquiryStatus.SUBMITTED) {
      throw new ConflictError(`Cannot review enquiry with status '${enquiry.status}'. Only 'SUBMITTED' enquiries can be reviewed.`);
    }

    return this.enquiryRepository.updateEnquiryStatus(
      enquiryId,
      EnquiryStatus.SUBMITTED,
      input.status,
      adminId,
      UserRole.ADMIN,
      input.notes
    );
  }

  async cancelEnquiryFarmer(enquiryId: string, farmerId: string, input: CancelEnquiryInput) {
    const enquiry = await this.enquiryRepository.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Ownership Check
    if (enquiry.farmerId !== farmerId) {
      throw new AuthorizationError('You do not have permission to cancel this enquiry');
    }

    // State Machine Rule: Farmer can only cancel SUBMITTED enquiries
    if (enquiry.status !== EnquiryStatus.SUBMITTED) {
      throw new ConflictError(`Cannot cancel enquiry with status '${enquiry.status}'. Only 'SUBMITTED' enquiries can be cancelled.`);
    }

    return this.enquiryRepository.updateEnquiryStatus(
      enquiryId,
      EnquiryStatus.SUBMITTED,
      EnquiryStatus.CANCELLED,
      farmerId,
      UserRole.FARMER,
      input.notes ?? 'Cancelled by farmer'
    );
  }

  async updateSampleWorkflowAdmin(
    enquiryId: string,
    adminId: string,
    sampleData: {
      sampleStatus: import('@prisma/client').SampleStatus;
      sampleCollectorNotes?: string;
      labReportImageUrl?: string;
      labRemarks?: string;
      quotedPricePerQtl?: number;
      distanceFromRewariKm?: number;
    }
  ) {
    const updated = await this.enquiryRepository.updateSampleWorkflow(
      enquiryId,
      sampleData,
      adminId,
      UserRole.ADMIN
    );

    // Fire non-blocking automated WhatsApp notification
    if (updated.farmer?.phone) {
      const { notifyFarmerSampleUpdate } = await import('../../shared/notifications/whatsapp.service');
      notifyFarmerSampleUpdate({
        farmerPhone: updated.farmer.phone,
        farmerName: updated.farmer.name,
        enquiryNumber: updated.enquiryNumber,
        enquiryId: updated.id,
        materialName: updated.materialName,
        sampleStatus: sampleData.sampleStatus,
        labRemarks: sampleData.labRemarks,
        quotedPricePerQtl: sampleData.quotedPricePerQtl,
      }).catch((err) => console.warn('[WHATSAPP_SAMPLE_NOTIFY_ERROR]', err));
    }

    return updated;
  }
}
