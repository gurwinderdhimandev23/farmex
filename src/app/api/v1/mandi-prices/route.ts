import { NextRequest } from "next/server";
import { MandiPriceService } from "@/server/modules/mandi-prices/mandi-price.service";
import { createMandiPriceSchema, mandiPriceQuerySchema } from "@/server/modules/mandi-prices/mandi-price.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const mandiPriceService = new MandiPriceService();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const validatedQuery = mandiPriceQuerySchema.parse(queryParams);
    const result = await mandiPriceService.getMandiPrices(validatedQuery);

    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const body = await req.json();
    const validatedData = createMandiPriceSchema.parse(body);

    const result = await mandiPriceService.createMandiPrice(authUser.sub, validatedData);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
