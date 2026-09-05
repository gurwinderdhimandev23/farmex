import { NextRequest } from "next/server";
import { AdminService } from "@/server/modules/admin/admin.service";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const adminService = new AdminService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const stats = await adminService.getDashboardStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
