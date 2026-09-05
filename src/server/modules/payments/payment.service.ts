import { PaymentRepository } from './payment.repository';
import { RecordCashPaymentInput, PaymentQueryInput } from './payment.schema';
import { EnquiryRepository } from '../enquiries/enquiry.repository';
import { EnquiryStatus, UserRole } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError } from '../../shared/errors/app-error';

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private enquiryRepository: EnquiryRepository;

  constructor(
    paymentRepository = new PaymentRepository(),
    enquiryRepository = new EnquiryRepository()
  ) {
    this.paymentRepository = paymentRepository;
    this.enquiryRepository = enquiryRepository;
  }

  async recordCashPayment(userId: string, userRole: UserRole, input: RecordCashPaymentInput) {
    // 1. Idempotency Key Check to prevent duplicate requests
    const existingPayment = await this.paymentRepository.findPaymentByIdempotencyKey(input.idempotencyKey);
    if (existingPayment) {
      return this.paymentRepository.findPaymentByEnquiryId(input.enquiryId);
    }

    const enquiry = await this.enquiryRepository.findEnquiryById(input.enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // 2. Rule: Delivery must be completed before recording final payment (PDF Spec Section 10)
    if (enquiry.status !== EnquiryStatus.DELIVERED) {
      throw new ConflictError(
        `Cannot record payment for enquiry with status '${enquiry.status}'. Delivery must be completed ('DELIVERED') first.`
      );
    }

    // 3. Authorization Check: Admin or assigned Transporter can record payment
    if (userRole === UserRole.TRANSPORTER) {
      const isAssigned = enquiry.assignments.some(
        (a) => a.transporterId === userId && a.status === 'ACCEPTED'
      );
      if (!isAssigned) {
        throw new AuthorizationError('You are not authorized to record payment for this trip');
      }
    }

    return this.paymentRepository.recordCashPayment(userId, userRole, input);
  }

  async getPaymentByEnquiryId(enquiryId: string, userId: string, userRole: UserRole) {
    const enquiry = await this.enquiryRepository.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Resource Ownership Check
    if (userRole === UserRole.FARMER && enquiry.farmerId !== userId) {
      throw new AuthorizationError('You do not have permission to view payment details for this enquiry');
    }

    const payment = await this.paymentRepository.findPaymentByEnquiryId(enquiryId);
    if (!payment) {
      throw new NotFoundError('No payment record found for this enquiry');
    }

    return payment;
  }

  async getMyEarningsSummary(transporterId: string) {
    return this.paymentRepository.getTransporterEarningsSummary(transporterId);
  }

  async getAllPaymentsAdmin(query: PaymentQueryInput) {
    return this.paymentRepository.findPayments(query);
  }
}
