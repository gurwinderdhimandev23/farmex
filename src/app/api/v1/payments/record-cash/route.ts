import { NextRequest } from "next/server";
import { PaymentService } from "@/server/modules/payments/payment.service";
import { recordCashPaymentSchema } from "@/server/modules/payments/payment.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const paymentService = new PaymentService();

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN, UserRole.TRANSPORTER]);

    const body = await req.json();
    const validatedData = recordCashPaymentSchema.parse(body);

    const result = await paymentService.recordCashPayment(authUser.sub, authUser.role, validatedData);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
