import { NextRequest } from "next/server";
import { AuthService } from "@/server/modules/auth/auth.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const authService = new AuthService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const user = await authService.getMe(authUser.sub);
    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const body = await req.json();
    const { updateProfileSchema } = await import("@/server/modules/auth/auth.schema");
    const validatedInput = updateProfileSchema.parse(body);

    const updatedUser = await authService.updateProfile(authUser.sub, validatedInput);
    return successResponse(updatedUser);
  } catch (error) {
    return errorResponse(error);
  }
}
