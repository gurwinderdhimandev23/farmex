import { AdminRepository } from './admin.repository';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor(adminRepository = new AdminRepository()) {
    this.adminRepository = adminRepository;
  }

  async getDashboardStats() {
    return this.adminRepository.getDashboardStats();
  }

  async getTransporters(pickupLat?: number | null, pickupLng?: number | null, enquiryId?: string | null) {
    return this.adminRepository.getTransporters(pickupLat, pickupLng, enquiryId);
  }

  async getUsers(params?: {
    role?: import('@prisma/client').UserRole;
    kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
    isActive?: boolean;
  }) {
    return this.adminRepository.getUsers(params);
  }

  async getUserById(userId: string) {
    return this.adminRepository.getUserById(userId);
  }

  async updateUser(userId: string, data: Parameters<AdminRepository['updateUserByAdmin']>[1]) {
    return this.adminRepository.updateUserByAdmin(userId, data);
  }

  async addVehicle(transporterProfileId: string, vehicle: Parameters<AdminRepository['addVehicle']>[1]) {
    return this.adminRepository.addVehicle(transporterProfileId, vehicle);
  }

  async deleteUser(userId: string) {
    return this.adminRepository.deleteUser(userId);
  }

  async getVehicleRateCards() {
    return this.adminRepository.getVehicleRateCards();
  }

  async upsertVehicleRateCard(data: Parameters<AdminRepository['upsertVehicleRateCard']>[0]) {
    return this.adminRepository.upsertVehicleRateCard(data);
  }
}

