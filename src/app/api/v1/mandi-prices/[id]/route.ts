import { NextRequest } from "next/server";
import { MandiPriceService } from "@/server/modules/mandi-prices/mandi-price.service";
import { updateMandiPriceSchema } from "@/server/modules/mandi-prices/mandi-price.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const mandiPriceService = new MandiPriceService();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const price = await mandiPriceService.getMandiPriceById(id);
    return successResponse(price);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateMandiPriceSchema.parse(body);

    const result = await mandiPriceService.updateMandiPrice(id, authUser.sub, validatedData);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);
    const { id } = await params;

    const result = await mandiPriceService.deleteMandiPrice(id, authUser.sub);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
