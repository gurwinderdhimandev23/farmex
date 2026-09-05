import { NextRequest } from "next/server";
import { TripService } from "@/server/modules/trips/trip.service";
import { tripQuerySchema } from "@/server/modules/trips/trip.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const tripService = new TripService();

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.TRANSPORTER]);

    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const validatedQuery = tripQuerySchema.parse(queryParams);
    const result = await tripService.getTransporterRequests(authUser.sub, validatedQuery);

    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
