import { PricingRepository } from './pricing.repository';
import { CreateLabourTypeInput, UpdateLabourTypeInput, SetEnquiryPricingInput, EstimatePricingInput } from './pricing.schema';
import { EnquiryRepository } from '../enquiries/enquiry.repository';
import { EnquiryStatus, UserRole } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError } from '../../shared/errors/app-error';

export class PricingService {
  private pricingRepository: PricingRepository;
  private enquiryRepository: EnquiryRepository;

  constructor(
    pricingRepository = new PricingRepository(),
    enquiryRepository = new EnquiryRepository()
  ) {
    this.pricingRepository = pricingRepository;
    this.enquiryRepository = enquiryRepository;
  }

  async estimatePricing(input: EstimatePricingInput) {
    const { distanceKm, weightQuintals, labourRequired, labourTypeId } = input;

    // Standard Mandi Express Rates (Admin configurable fallback values)
    const baseFee = 250; // Base trip booking fee in INR
    const ratePerKm = 22; // Transport rate per kilometer
    const ratePerQuintalKm = 0.45; // Weight-distance factor rate

    // Transport calculation
    const transportDistancePrice = distanceKm * ratePerKm;
    const weightFactorPrice = weightQuintals * distanceKm * ratePerQuintalKm;
    const rawTransportPrice = baseFee + transportDistancePrice + weightFactorPrice;
    const transportPrice = Math.round(rawTransportPrice);

    // Labour calculation per quintal
    let labourRatePerQuintal = 35; // Default rate per quintal (₹35/quintal loading/unloading)

    if (labourTypeId) {
      const labourType = await this.pricingRepository.findLabourTypeById(labourTypeId);
      if (labourType) {
        labourRatePerQuintal = Number(labourType.basePrice);
      }
    }

    const labourPrice = labourRequired ? Math.round(weightQuintals * labourRatePerQuintal) : 0;
    const totalAmount = transportPrice + labourPrice;

    return {
      distanceKm,
      weightQuintals,
      baseFee,
      ratePerKm,
      transportPrice,
      labourRequired,
      labourRatePerQuintal: labourRequired ? labourRatePerQuintal : 0,
      labourPrice,
      totalAmount,
    };
  }

  async createLabourType(input: CreateLabourTypeInput) {
    return this.pricingRepository.createLabourType(input);
  }

  async getLabourTypes(activeOnly = true) {
    return this.pricingRepository.findLabourTypes(activeOnly);
  }

  async updateLabourType(id: string, input: UpdateLabourTypeInput) {
    const existing = await this.pricingRepository.findLabourTypeById(id);
    if (!existing) {
      throw new NotFoundError('Labour type not found');
    }
    return this.pricingRepository.updateLabourType(id, input);
  }

  async setEnquiryPricing(enquiryId: string, adminId: string, input: SetEnquiryPricingInput) {
    const enquiry = await this.enquiryRepository.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Rule: Pricing can only be entered for accepted enquiries (AGENTS.md Section 17 & PDF Spec)
    if (
      enquiry.status !== EnquiryStatus.ADMIN_ACCEPTED &&
      enquiry.status !== EnquiryStatus.TRANSPORTER_ASSIGNED &&
      enquiry.status !== EnquiryStatus.TRANSPORTER_ACCEPTED
    ) {
      throw new ConflictError(
        `Cannot set pricing for enquiry with status '${enquiry.status}'. Enquiry must be accepted by Admin first.`
      );
    }

    return this.pricingRepository.setEnquiryPricing(enquiryId, adminId, input);
  }

  async getEnquiryPricing(enquiryId: string, userId: string, userRole: UserRole) {
    const enquiry = await this.enquiryRepository.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Ownership & Access Security Rule
    if (userRole === UserRole.FARMER && enquiry.farmerId !== userId) {
      throw new AuthorizationError('You do not have permission to view pricing for this enquiry');
    }

    const pricing = await this.pricingRepository.findPricingByEnquiryId(enquiryId);
    if (!pricing) {
      throw new NotFoundError('Pricing has not been set by Admin for this enquiry yet');
    }

    return pricing;
  }
}

