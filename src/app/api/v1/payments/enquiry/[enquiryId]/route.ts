import { NextRequest } from "next/server";
import { PaymentService } from "@/server/modules/payments/payment.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const paymentService = new PaymentService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    const { enquiryId } = await params;

    const payment = await paymentService.getPaymentByEnquiryId(enquiryId, authUser.sub, authUser.role);
    return successResponse(payment);
  } catch (error) {
    return errorResponse(error);
  }
}
