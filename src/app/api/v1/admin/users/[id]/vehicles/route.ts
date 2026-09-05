import { NextRequest } from "next/server";
import { AdminService } from "@/server/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/server/shared/http/next-response";
import { NotFoundError, ValidationError } from "@/server/shared/errors/app-error";

const adminService = new AdminService();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const user = await adminService.getUserById(id);
    if (!user || !user.transporterProfile) {
      throw new NotFoundError("Transporter profile not found for this user");
    }

    if (!body.registrationNumber || !body.vehicleType || !body.capacityTonnes) {
      throw new ValidationError("Registration number, vehicle type, and capacity are required");
    }

    const vehicle = await adminService.addVehicle(user.transporterProfile.id, {
      registrationNumber: body.registrationNumber.trim().toUpperCase(),
      vehicleType: body.vehicleType.trim(),
      capacityTonnes: Number(body.capacityTonnes),
    });

    return successResponse(vehicle, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
