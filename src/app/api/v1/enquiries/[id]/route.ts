import { NextRequest } from "next/server";
import { EnquiryService } from "@/server/modules/enquiries/enquiry.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const enquiryService = new EnquiryService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    const { id } = await params;

    const enquiry = await enquiryService.getEnquiryById(id, authUser.sub, authUser.role);
    return successResponse(enquiry);
  } catch (error) {
    return errorResponse(error);
  }
}
