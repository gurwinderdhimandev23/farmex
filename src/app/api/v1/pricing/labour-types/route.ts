import { NextRequest } from "next/server";
import { PricingService } from "@/server/modules/pricing/pricing.service";
import { createLabourTypeSchema } from "@/server/modules/pricing/pricing.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const pricingService = new PricingService();

export async function GET(_req: NextRequest) {
  try {
    const labourTypes = await pricingService.getLabourTypes();
    return successResponse(labourTypes);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const body = await req.json();
    const validatedData = createLabourTypeSchema.parse(body);

    const result = await pricingService.createLabourType(validatedData);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
