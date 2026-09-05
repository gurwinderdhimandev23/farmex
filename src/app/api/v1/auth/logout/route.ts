import { NextRequest } from "next/server";
import { AuthService } from "@/server/modules/auth/auth.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    let userId: string | undefined;
    try {
      const user = getAuthUser(req);
      userId = user.sub;
    } catch (_e) {
      // Allow logout even if token is expired
    }

    let refreshToken: string | undefined;
    try {
      const body = await req.json();
      refreshToken = body?.refreshToken;
    } catch (_e) {
      // Empty body is okay
    }

    const result = await authService.logout(refreshToken, userId);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
