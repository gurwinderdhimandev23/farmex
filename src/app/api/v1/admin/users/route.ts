import { NextRequest } from "next/server";
import { AdminService } from "@/server/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/server/shared/http/next-response";
import { AuthService } from "@/server/modules/auth/auth.service";
import { UserRole } from "@prisma/client";

const adminService = new AdminService();
const authService = new AuthService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") as UserRole | null;
    const kycStatus = searchParams.get("kycStatus") as "PENDING" | "APPROVED" | "REJECTED" | null;
    const search = searchParams.get("search") || undefined;
    const isActiveParam = searchParams.get("isActive");

    const users = await adminService.getUsers({
      role: roleParam || undefined,
      kycStatus: kycStatus || undefined,
      search,
      isActive: isActiveParam !== null ? isActiveParam === "true" : undefined,
    });

    return successResponse(users);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await authService.register(body);
    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
