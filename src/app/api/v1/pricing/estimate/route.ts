import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      weightQuintals: inputQuintals,
      quantityQuintals,
      quantityKg,
      distanceKm = 10,
      labourRequired = false,
      pickupLat,
      pickupLng,
      destLat,
      destLng,
    } = body;

    // Direct quintal input or fallback from Kg
    let weightQuintals = 10;
    if (inputQuintals !== undefined && inputQuintals !== null && !isNaN(Number(inputQuintals))) {
      weightQuintals = Math.max(0.1, parseFloat(String(inputQuintals)));
    } else if (quantityQuintals !== undefined && quantityQuintals !== null && !isNaN(Number(quantityQuintals))) {
      weightQuintals = Math.max(0.1, parseFloat(String(quantityQuintals)));
    } else if (quantityKg !== undefined && quantityKg !== null && !isNaN(Number(quantityKg))) {
      weightQuintals = Math.max(0.1, parseFloat(String(quantityKg)) / 100);
    }

    // Calculate distance (KM)
    let dist = parseFloat(String(distanceKm)) || 10;
    if (pickupLat && pickupLng && destLat && destLng) {
      // Haversine distance formula
      const R = 6371; // Earth radius in km
      const dLat = ((destLat - pickupLat) * Math.PI) / 180;
      const dLng = ((destLng - pickupLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickupLat * Math.PI) / 180) *
          Math.cos((destLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      dist = Math.max(1, Math.round(R * c * 1.2)); // 1.2 road distance factor
    }

    // Formula from Client WhatsApp Chat:
    // Base Price = Distance (KM) x Weight (Quintals) x 3.50
    // Platform Fee = 15% of Base Price
    // Subtotal Transport = Base Price + Platform Fee
    const ratePerKmPerQuintal = 3.50;
    const baseTransportPrice = Math.round(dist * weightQuintals * ratePerKmPerQuintal);
    const platformFee = Math.round(baseTransportPrice * 0.15); // 15% Platform Fee
    const transportPrice = baseTransportPrice + platformFee;

    // Labour Pricing
    const labourRatePerQuintal = 35; // ₹35 per quintal
    const labourPrice = labourRequired ? Math.round(weightQuintals * labourRatePerQuintal) : 0;

    // Total Amount
    const totalAmount = transportPrice + labourPrice;

    return NextResponse.json({
      success: true,
      data: {
        distanceKm: dist,
        weightQuintals,
        baseTransportPrice,
        platformFee,
        transportPrice,
        labourPrice,
        labourRatePerQuintal,
        totalAmount,
        formula: "Distance x Weight(Quintals) x 3.50 + 15% Platform Fee",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : "Failed to calculate estimate" },
      },
      { status: 500 }
    );
  }
}
