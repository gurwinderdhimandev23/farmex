import { NextRequest } from "next/server";
import { PricingService } from "@/server/modules/pricing/pricing.service";
import { updateLabourTypeSchema } from "@/server/modules/pricing/pricing.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const pricingService = new PricingService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateLabourTypeSchema.parse(body);

    const result = await pricingService.updateLabourType(id, validatedData);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
