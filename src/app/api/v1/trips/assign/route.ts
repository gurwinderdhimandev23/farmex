import { NextRequest } from "next/server";
import { TripService } from "@/server/modules/trips/trip.service";
import { assignTransporterSchema } from "@/server/modules/trips/trip.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const tripService = new TripService();

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.ADMIN]);

    const body = await req.json();
    const validatedData = assignTransporterSchema.parse(body);

    const result = await tripService.assignTransporter(authUser.sub, validatedData);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
