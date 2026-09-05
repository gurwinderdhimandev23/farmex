import { NextRequest } from "next/server";
import { AdminService } from "@/server/modules/admin/admin.service";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const adminService = new AdminService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("pickupLat");
    const lngParam = searchParams.get("pickupLng");
    const enquiryId = searchParams.get("enquiryId");

    const pickupLat = latParam ? parseFloat(latParam) : null;
    const pickupLng = lngParam ? parseFloat(lngParam) : null;

    const transporters = await adminService.getTransporters(pickupLat, pickupLng, enquiryId);
    return successResponse(transporters);
  } catch (error) {
    return errorResponse(error);
  }
}
