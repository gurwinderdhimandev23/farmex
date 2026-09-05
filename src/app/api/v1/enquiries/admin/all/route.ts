import { NextRequest } from "next/server";
import { EnquiryService } from "@/server/modules/enquiries/enquiry.service";
import { enquiryQuerySchema } from "@/server/modules/enquiries/enquiry.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const enquiryService = new EnquiryService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const validatedQuery = enquiryQuerySchema.parse(queryParams);
    const result = await enquiryService.getAllEnquiriesAdmin(validatedQuery);

    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
