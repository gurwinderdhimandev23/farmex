import { NextRequest } from "next/server";
import { AuthService } from "@/server/modules/auth/auth.service";
import { refreshTokenSchema } from "@/server/modules/auth/auth.schema";
import { successResponse, errorResponse } from "@/server/shared/http/next-response";

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = refreshTokenSchema.parse(body);
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;

    const result = await authService.refresh(validatedData.refreshToken, userAgent, ipAddress);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
