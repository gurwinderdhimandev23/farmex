import { Enquiry, VehicleRateCard } from "@/types/api";

export interface VehicleRateCardDefinition {
  category: 'SUPER_CARRY' | 'PICKUP' | 'TRACTOR_TROLLY' | 'CANTER' | string;
  displayName: string;
  capacityMinQtl: number;
  capacityMaxQtl: number;
  basicFreight: number;
  ratePerKm: number;
  platformFeePct: number; // e.g. 15 for 15%
}

/**
 * Master Vehicle Rate Cards strictly matched with Farm_EX.xlsx
 */
export const DEFAULT_VEHICLE_RATE_CARDS: VehicleRateCardDefinition[] = [
  {
    category: 'SUPER_CARRY',
    displayName: 'Super Carry',
    capacityMinQtl: 15,
    capacityMaxQtl: 25,
    basicFreight: 450,
    ratePerKm: 40,
    platformFeePct: 15,
  },
  {
    category: 'PICKUP',
    displayName: 'Pick-up',
    capacityMinQtl: 25,
    capacityMaxQtl: 40,
    basicFreight: 650,
    ratePerKm: 47,
    platformFeePct: 15,
  },
  {
    category: 'TRACTOR_TROLLY',
    displayName: 'Tractor Trolley',
    capacityMinQtl: 24,
    capacityMaxQtl: 50,
    basicFreight: 850,
    ratePerKm: 60,
    platformFeePct: 15,
  },
  {
    category: 'CANTER',
    displayName: 'Canter',
    capacityMinQtl: 50,
    capacityMaxQtl: 100,
    basicFreight: 1500,
    ratePerKm: 95,
    platformFeePct: 15,
  },
];

export interface VehicleCalculationResult {
  category: string;
  displayName: string;
  capacityMinQtl: number;
  capacityMaxQtl: number;
  basicFreight: number;
  ratePerKm: number;
  distanceKm: number;
  distanceCharges: number;
  totalFreight: number;
  platformFee: number;
  platformFeePct: number;
  driverPayout: number;
  isEligible: boolean;
}

/**
 * Calculate pricing for a specific vehicle category based on Farm_EX.xlsx formulas
 */
export function calculateVehiclePricing(
  card: VehicleRateCardDefinition | VehicleRateCard,
  distanceKm: number,
  weightQtl: number
): VehicleCalculationResult {
  const minCap = Number(card.capacityMinQtl);
  const maxCap = Number(card.capacityMaxQtl);
  const basic = Number(card.basicFreight);
  const perKm = Number(card.ratePerKm);
  const feePct = Number(card.platformFeePct || 15);
  const dist = Math.max(1, Number(distanceKm));

  // Eligibility: Weight (Qtl) between min and max capacity
  const isEligible = weightQtl >= minCap && weightQtl <= maxCap;

  const distanceCharges = Math.round(dist * perKm);
  const totalFreight = basic + distanceCharges;
  const platformFee = Math.round((totalFreight * feePct) / 100);
  const driverPayout = totalFreight - platformFee;

  return {
    category: card.category,
    displayName: card.displayName,
    capacityMinQtl: minCap,
    capacityMaxQtl: maxCap,
    basicFreight: basic,
    ratePerKm: perKm,
    distanceKm: dist,
    distanceCharges,
    totalFreight,
    platformFee,
    platformFeePct: feePct,
    driverPayout,
    isEligible,
  };
}

/**
 * Get all vehicle calculation options for a given weight & distance
 */
export function getAllVehicleQuotes(
  weightQtl: number,
  distanceKm: number,
  rateCards: (VehicleRateCardDefinition | VehicleRateCard)[] = DEFAULT_VEHICLE_RATE_CARDS
): VehicleCalculationResult[] {
  return rateCards.map((card) => calculateVehiclePricing(card, distanceKm, weightQtl));
}

/**
 * Get the most suitable / best-fit vehicle quote
 */
export function getBestVehicleQuote(
  weightQtl: number,
  distanceKm: number,
  rateCards: (VehicleRateCardDefinition | VehicleRateCard)[] = DEFAULT_VEHICLE_RATE_CARDS
): VehicleCalculationResult {
  const allQuotes = getAllVehicleQuotes(weightQtl, distanceKm, rateCards);
  const eligibleQuotes = allQuotes.filter((q) => q.isEligible);

  if (eligibleQuotes.length > 0) {
    // Return the lowest total freight among eligible vehicles
    return eligibleQuotes.sort((a, b) => a.totalFreight - b.totalFreight)[0];
  }

  // If no vehicle strictly matches, return closest capacity
  return allQuotes.sort((a, b) => {
    const diffA = Math.min(Math.abs(weightQtl - a.capacityMinQtl), Math.abs(weightQtl - a.capacityMaxQtl));
    const diffB = Math.min(Math.abs(weightQtl - b.capacityMinQtl), Math.abs(weightQtl - b.capacityMaxQtl));
    return diffA - diffB;
  })[0];
}

export interface UpfrontQuoteBreakdown {
  totalAmount: number;
  transportPrice: number;
  labourPrice: number;
  distanceKm: number;
  fromNote: boolean;
  vehicleName?: string;
  driverPayout?: number;
  platformFee?: number;
}

/**
 * Resolves the actual trip distance (KM) between pickup and destination
 */
export function getEnquiryRouteDistance(enq: Enquiry): number {
  // 1. First check if distance was explicitly recorded in the upfront quote tag in notes
  const distMatch = enq.notes?.match(/Distance:\s*([\d.]+)\s*KM/i);
  if (distMatch && !isNaN(parseFloat(distMatch[1]))) {
    return Math.round(parseFloat(distMatch[1]));
  }

  // 2. If pickup and destination coordinates exist, calculate actual road distance
  const pLat = enq.pickupLatitude !== undefined && enq.pickupLatitude !== null ? Number(enq.pickupLatitude) : null;
  const pLng = enq.pickupLongitude !== undefined && enq.pickupLongitude !== null ? Number(enq.pickupLongitude) : null;
  const dLat = enq.destinationLatitude !== undefined && enq.destinationLatitude !== null ? Number(enq.destinationLatitude) : null;
  const dLng = enq.destinationLongitude !== undefined && enq.destinationLongitude !== null ? Number(enq.destinationLongitude) : null;

  if (pLat !== null && pLng !== null && dLat !== null && dLng !== null) {
    const R = 6371; // Earth's radius in KM
    const dLatRad = ((dLat - pLat) * Math.PI) / 180;
    const dLonRad = ((dLng - pLng) * Math.PI) / 180;
    const a =
      Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
      Math.cos((pLat * Math.PI) / 180) *
        Math.cos((dLat * Math.PI) / 180) *
        Math.sin(dLonRad / 2) *
        Math.sin(dLonRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    return Math.max(5, Math.round(straightDist * 1.25));
  }

  // 3. Fallback to reasonable distance
  return 25;
}

/**
 * Get upfront quote for an enquiry, using saved note or Farm_EX.xlsx master calculation
 */
export function getEnquiryUpfrontQuote(enq: Enquiry): UpfrontQuoteBreakdown {
  // 1. Flexible regex to extract saved upfront quote from notes
  // Format: [Upfront Quote: Total ₹... | Transport: ₹... | Labour...: ₹... | Distance: ... KM | Vehicle: ...]
  const totalMatch = enq.notes?.match(/Total\s*₹(\d+)/i);
  const transportMatch = enq.notes?.match(/Transport:\s*₹(\d+)/i);
  const labourMatch = enq.notes?.match(/Labour[^:]*:\s*₹(\d+)/i);
  const distMatch = enq.notes?.match(/Distance:\s*([\d.]+)\s*KM/i);
  const vehicleMatch = enq.notes?.match(/Vehicle:\s*([^\]]+)/i);

  if (totalMatch && transportMatch) {
    const total = parseInt(totalMatch[1], 10);
    const transport = parseInt(transportMatch[1], 10);
    const labour = labourMatch ? parseInt(labourMatch[1], 10) : 0;
    const dist = distMatch ? Math.round(parseFloat(distMatch[1])) : getEnquiryRouteDistance(enq);
    const platformFee = Math.round(transport * 0.15);
    const driverPayout = transport - platformFee;
    const vehicleName = vehicleMatch ? vehicleMatch[1].trim() : (enq.vehicleRequirement ?? undefined);

    return {
      totalAmount: total,
      transportPrice: transport,
      labourPrice: labour,
      distanceKm: dist,
      fromNote: true,
      vehicleName,
      platformFee,
      driverPayout,
    };
  }

  // 2. Calculate using exact route distance (pickup to destination)
  const weightQuintals = Math.max(0.1, Number(enq.quantityKg) / 100);
  const dist = getEnquiryRouteDistance(enq);

  const bestQuote = getBestVehicleQuote(weightQuintals, dist);
  const transport = bestQuote.totalFreight;
  const labour = enq.labourRequired ? Math.round(weightQuintals * 35) : 0;
  const total = transport + labour;

  return {
    totalAmount: total,
    transportPrice: transport,
    labourPrice: labour,
    distanceKm: dist,
    fromNote: false,
    vehicleName: bestQuote.displayName,
    driverPayout: bestQuote.driverPayout,
    platformFee: bestQuote.platformFee,
  };
}
