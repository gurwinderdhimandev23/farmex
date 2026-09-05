import { NextRequest } from "next/server";
import { AdminService } from "@/server/modules/admin/admin.service";
import { successResponse, errorResponse } from "@/server/shared/http/next-response";
import { hashPassword } from "@/server/shared/utils/crypto.utils";
import { NotFoundError } from "@/server/shared/errors/app-error";

const adminService = new AdminService();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await adminService.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    let passwordHash: string | undefined = undefined;
    if (body.newPassword && typeof body.newPassword === "string" && body.newPassword.length >= 6) {
      passwordHash = await hashPassword(body.newPassword);
    }

    const updatedUser = await adminService.updateUser(id, {
      ...body,
      passwordHash,
    });

    return successResponse(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await adminService.deleteUser(id);
    return successResponse(null);
  } catch (error) {
    return errorResponse(error);
  }
}
