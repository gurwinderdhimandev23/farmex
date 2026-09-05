import { NextRequest } from "next/server";
import prisma from "@/server/database/database";
import { successResponse, errorResponse } from "@/server/shared/http/next-response";
import { TransporterStatus } from "@prisma/client";

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "30.9010");
    const lng = parseFloat(searchParams.get("lng") || "75.8573");
    const weightKg = parseFloat(searchParams.get("weightKg") || "1000");

    const requiredTonnes = weightKg / 1000;

    // Find all transporters with active status
    const transporters = await prisma.transporterProfile.findMany({
      where: {
        status: TransporterStatus.AVAILABLE,
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        vehicles: {
          where: {
            isActive: true,
            capacityTonnes: {
              gte: requiredTonnes,
            },
          },
        },
      },
    });

    const results = [];

    for (const t of transporters) {
      if (t.vehicles.length === 0) continue; // Must match capacity constraint

      const tLat = t.latitude ? Number(t.latitude) : lat + 0.05;
      const tLng = t.longitude ? Number(t.longitude) : lng + 0.05;

      const distanceKm = calculateHaversineDistance(lat, lng, tLat, tLng);

      results.push({
        transporterId: t.user.id,
        name: t.user.name,
        phone: t.user.phone,
        licenseNumber: t.licenseNumber,
        distanceKm,
        matchedVehicle: t.vehicles[0],
        offersLabour: true,
      });
    }

    // Sort by nearest distance

    
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return successResponse({
      transporters: results,
      hasNearby: results.length > 0,
      labourAvailable: true,
      count: results.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
