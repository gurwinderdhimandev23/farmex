import { NextRequest } from "next/server";
import { TripService } from "@/server/modules/trips/trip.service";
import { updateTripStatusSchema } from "@/server/modules/trips/trip.schema";
import { getAuthUser, requireRole, successResponse, errorResponse } from "@/server/shared/http/next-response";
import { UserRole } from "@prisma/client";

const tripService = new TripService();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    requireRole(authUser, [UserRole.TRANSPORTER]);
    const { id } = await params;

    const body = await req.json();
    const validatedData = updateTripStatusSchema.parse(body);

    const result = await tripService.updateTripStatus(id, authUser.sub, validatedData);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
