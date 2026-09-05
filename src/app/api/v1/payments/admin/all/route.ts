import { NextRequest } from "next/server";
import { PaymentService } from "@/server/modules/payments/payment.service";
import { paymentQuerySchema } from "@/server/modules/payments/payment.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const paymentService = new PaymentService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const validatedQuery = paymentQuerySchema.parse(queryParams);
    const result = await paymentService.getAllPaymentsAdmin(validatedQuery);

    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
