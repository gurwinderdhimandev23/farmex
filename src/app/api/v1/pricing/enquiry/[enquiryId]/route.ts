import { NextRequest } from "next/server";
import { PricingService } from "@/server/modules/pricing/pricing.service";
import { setEnquiryPricingSchema } from "@/server/modules/pricing/pricing.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const pricingService = new PricingService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    const { enquiryId } = await params;

    const pricing = await pricingService.getEnquiryPricing(enquiryId, authUser.sub, authUser.role);
    return successResponse(pricing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ enquiryId: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);
    const { enquiryId } = await params;

    const body = await req.json();
    const validatedData = setEnquiryPricingSchema.parse(body);

    const result = await pricingService.setEnquiryPricing(enquiryId, authUser.sub, validatedData);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
