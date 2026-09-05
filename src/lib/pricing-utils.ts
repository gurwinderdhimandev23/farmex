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
 * Get upfront quote for an enquiry, using saved note or Farm_EX.xlsx master calculation
 */
export function getEnquiryUpfrontQuote(enq: Enquiry): UpfrontQuoteBreakdown {
  // Check if saved upfront quote tag exists in notes: [Upfront Quote: Total ₹... | Transport: ₹... | Labour: ₹... | Distance: ... KM]
  const quoteMatch = enq.notes?.match(
    /\[Upfront Quote: Total ₹(\d+) \| Transport: ₹(\d+) \| Labour: ₹(\d+) \| Distance: (\d+) KM\]/
  );
  if (quoteMatch) {
    const total = parseInt(quoteMatch[1], 10);
    const transport = parseInt(quoteMatch[2], 10);
    const labour = parseInt(quoteMatch[3], 10);
    const dist = parseInt(quoteMatch[4], 10);
    const platformFee = Math.round(transport * 0.15);
    const driverPayout = transport - platformFee;

    return {
      totalAmount: total,
      transportPrice: transport,
      labourPrice: labour,
      distanceKm: dist,
      fromNote: true,
      platformFee,
      driverPayout,
    };
  }

  // Calculate using Farm_EX.xlsx rate card
  const weightQuintals = Math.max(0.1, Number(enq.quantityKg) / 100);
  const dist = enq.distanceFromRewariKm ? Number(enq.distanceFromRewariKm) : 20;

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
