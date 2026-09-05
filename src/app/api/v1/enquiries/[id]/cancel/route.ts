import { NextRequest } from "next/server";
import { EnquiryService } from "@/server/modules/enquiries/enquiry.service";
import { cancelEnquirySchema } from "@/server/modules/enquiries/enquiry.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const enquiryService = new EnquiryService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.FARMER]);
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const validatedData = cancelEnquirySchema.parse(body);

    const result = await enquiryService.cancelEnquiryFarmer(id, authUser.sub, validatedData);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
