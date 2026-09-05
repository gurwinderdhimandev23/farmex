import { NextRequest } from "next/server";
import { AuthService } from "@/server/modules/auth/auth.service";
import { changePasswordSchema } from "@/server/modules/auth/auth.schema";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    const result = await authService.changePassword(authUser.sub, validatedData);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
