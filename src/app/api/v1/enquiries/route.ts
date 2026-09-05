import { NextRequest } from "next/server";
import { EnquiryService } from "@/server/modules/enquiries/enquiry.service";
import { createEnquirySchema, enquiryQuerySchema } from "@/server/modules/enquiries/enquiry.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const enquiryService = new EnquiryService();

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.FARMER, UserRole.ADMIN]);

    const body = await req.json();
    const validatedData = createEnquirySchema.parse(body);

    const enquiry = await enquiryService.createEnquiry(authUser.sub, validatedData);
    return successResponse(enquiry, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const validatedQuery = enquiryQuerySchema.parse(queryParams);

    if (authUser.role === UserRole.ADMIN) {
      const result = await enquiryService.getAllEnquiriesAdmin(validatedQuery);
      return successResponse(result.data, 200, result.meta);
    }

    const result = await enquiryService.getMyEnquiries(authUser.sub, validatedQuery);
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
