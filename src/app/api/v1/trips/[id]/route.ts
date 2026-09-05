import { NextRequest } from "next/server";
import { TripService } from "@/server/modules/trips/trip.service";
import { getAuthUser, successResponse, errorResponse } from "@/server/shared/http/next-response";

const tripService = new TripService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(req);
    const { id } = await params;

    const trip = await tripService.getTripById(id, authUser.sub, authUser.role);
    return successResponse(trip);
  } catch (error) {
    return errorResponse(error);
  }
}
