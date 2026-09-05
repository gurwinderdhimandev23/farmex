import { NextRequest } from "next/server";
import { PaymentService } from "@/server/modules/payments/payment.service";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const paymentService = new PaymentService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.TRANSPORTER]);

    const earnings = await paymentService.getMyEarningsSummary(authUser.sub);
    return successResponse(earnings);
  } catch (error) {
    return errorResponse(error);
  }
}
