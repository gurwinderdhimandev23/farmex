import { NextRequest } from "next/server";
import { AdminService } from "@/server/modules/admin/admin.service";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";
import { DEFAULT_VEHICLE_RATE_CARDS } from "@/lib/pricing-utils";

const adminService = new AdminService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const cards = await adminService.getVehicleRateCards();
    if (cards.length === 0) {
      return successResponse(DEFAULT_VEHICLE_RATE_CARDS);
    }
    return successResponse(cards);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const body = await req.json();
    const updated = await adminService.upsertVehicleRateCard({
      category: body.category,
      displayName: body.displayName,
      capacityMinQtl: Number(body.capacityMinQtl),
      capacityMaxQtl: Number(body.capacityMaxQtl),
      basicFreight: Number(body.basicFreight),
      ratePerKm: Number(body.ratePerKm),
      platformFeePct: body.platformFeePct !== undefined ? Number(body.platformFeePct) : 15,
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
