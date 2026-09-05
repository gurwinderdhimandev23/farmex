import { NextRequest } from "next/server";
import { EnquiryService } from "@/server/modules/enquiries/enquiry.service";
import { updateSampleStatusSchema } from "@/server/modules/enquiries/enquiry.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const enquiryService = new EnquiryService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateSampleStatusSchema.parse(body);

    const updatedEnquiry = await enquiryService.updateSampleWorkflowAdmin(
      id,
      authUser.sub,
      validatedData
    );

    return successResponse(updatedEnquiry);
  } catch (error) {
    return errorResponse(error);
  }
}
