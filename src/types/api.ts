// Mandi Express & FarmEx Frontend Domain & API Types
// Strictly matched with backend Prisma models and enums

export type UserRole = 'FARMER' | 'TRANSPORTER' | 'ADMIN';

export type TransporterStatus = 'AVAILABLE' | 'ON_TRIP' | 'INACTIVE';

export type SampleStatus =
  | 'PENDING_COLLECTION'
  | 'COLLECTION_ASSIGNED'
  | 'SAMPLE_COLLECTED'
  | 'APPROVED'
  | 'REJECTED';

export type EnquiryStatus =
  | 'SUBMITTED'
  | 'ADMIN_ACCEPTED'
  | 'ADMIN_REJECTED'
  | 'TRANSPORTER_ASSIGNED'
  | 'TRANSPORTER_ACCEPTED'
  | 'TRANSPORTER_REJECTED'
  | 'PICKUP'
  | 'IN_TRANSIT'
  | 'ON_DESTINATION'
  | 'DELIVERED'
  | 'PAYMENT_COMPLETED'
  | 'CANCELLED';

export type AssignmentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type TripStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKUP'
  | 'IN_TRANSIT'
  | 'ON_DESTINATION'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'ONLINE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type NotificationType = 'ENQUIRY_UPDATE' | 'TRIP_ASSIGNED' | 'PAYMENT_RECEIVED' | 'SYSTEM';

// Base User & Profiles
export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  farmerProfile?: FarmerProfile | null;
  transporterProfile?: TransporterProfile | null;
  distanceKm?: number;
  distanceBadge?: string;
  badgeColor?: 'emerald' | 'green' | 'amber' | 'slate' | 'neutral';
}

export interface FarmerProfile {
  id: string;
  userId: string;
  address?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TransporterProfile {
  id: string;
  userId: string;
  licenseNumber?: string | null;
  licensePhotoUrl?: string | null;
  aadhaarNumber?: string | null;
  aadhaarFrontUrl?: string | null;
  aadhaarBackUrl?: string | null;
  kycStatus: KycStatus;
  isVerified: boolean;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status: TransporterStatus;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  transporterProfileId: string;
  registrationNumber: string;
  vehicleType: string;
  capacityTonnes: number | string;
  isActive: boolean;
}

// Master Labour Types
export interface LabourType {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryLabour {
  id: string;
  enquiryId: string;
  labourTypeId: string;
  labourType?: LabourType;
  quantity: number;
  notes?: string | null;
  labourPricing?: LabourPricing | null;
}

export interface LabourPricing {
  id: string;
  enquiryLabourId: string;
  labourTypeId: string;
  labourType?: LabourType;
  adminId: string;
  unitPrice: number | string;
  totalLabourPrice: number | string;
}

export interface TransportPricing {
  id: string;
  enquiryId: string;
  adminId: string;
  admin?: { id: string; name: string };
  transportPrice: number | string;
  labourPrice: number | string;
  totalAmount: number | string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransportAssignment {
  id: string;
  enquiryId: string;
  transporterId: string;
  transporter?: User;
  status: AssignmentStatus;
  assignedAt: string;
  respondedAt?: string | null;
  rejectionReason?: string | null;
}

export interface Trip {
  id: string;
  tripNumber: string;
  enquiryId: string;
  enquiry?: Enquiry;
  transporterId: string;
  transporter?: User;
  vehicleId?: string | null;
  vehicle?: Vehicle | null;
  status: TripStatus;
  pickupTime?: string | null;
  inTransitTime?: string | null;
  destinationTime?: string | null;
  deliveryTime?: string | null;
  startOdometer?: number | string | null;
  endOdometer?: number | string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  receiptNumber: string;
  enquiryId: string;
  tripId?: string | null;
  amount: number | string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  idempotencyKey?: string | null;
  paidAt?: string | null;
  recordedBy?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface EnquiryStatusHistory {
  id: string;
  enquiryId: string;
  fromStatus?: EnquiryStatus | null;
  toStatus: EnquiryStatus;
  actorId?: string | null;
  actorRole?: UserRole | null;
  notes?: string | null;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  enquiryNumber: string;
  farmerId: string;
  farmer?: User;
  pickupLocation: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;
  destinationLocation: string;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
  materialName: string;
  quantityKg: number | string;
  vehicleTypeId?: string | null;
  preferredVehicle?: Vehicle | null;
  vehicleRequirement?: string | null;
  pickupDate: string;
  preferredTimeSlot?: string | null;
  labourRequired: boolean;
  notes?: string | null;
  status: EnquiryStatus;
  isReturnLoad: boolean;
  isSellFromFarm?: boolean;
  sampleStatus?: SampleStatus | null;
  samplePreferredDate?: string | null;
  samplePreferredSlot?: string | null;
  sampleCollectorNotes?: string | null;
  sampleCollectedAt?: string | null;
  labReportImageUrl?: string | null;
  labRemarks?: string | null;
  quotedPricePerQtl?: number | string | null;
  distanceFromRewariKm?: number | string | null;
  createdAt: string;
  updatedAt: string;
  transportPricing?: TransportPricing | null;
  enquiryLabours?: EnquiryLabour[];
  assignments?: TransportAssignment[];
  trips?: Trip[];
  payments?: Payment[];
  statusHistory?: EnquiryStatusHistory[];
}

export interface VehicleRateCard {
  id: string;
  category: 'SUPER_CARRY' | 'PICKUP' | 'TRACTOR_TROLLY' | 'CANTER' | string;
  displayName: string;
  capacityMinQtl: number | string;
  capacityMaxQtl: number | string;
  basicFreight: number | string;
  ratePerKm: number | string;
  platformFeePct: number | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MandiPriceGrade {
  id?: string;
  mandiPriceId?: string;
  gradeName: string;
  minPrice: number | string;
  maxPrice: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MandiPrice {
  id: string;
  mandiName: string;
  productName: string;
  price?: number | string | null;
  unit: string;
  isActive: boolean;
  adminId: string;
  admin?: { id: string; name: string };
  grades: MandiPriceGrade[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
}

export interface AdminDashboardStats {
  totalFarmers: number;
  totalTransporters: number;
  pendingEnquiriesCount: number;
  activeEnquiriesCount: number;
  activeTripsCount: number;
  completedDeliveriesCount: number;
  totalRevenueCash: number;
}

// API Envelope Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export interface AuthResponseData {
  user: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  accessToken?: string;
  refreshToken?: string;
}
