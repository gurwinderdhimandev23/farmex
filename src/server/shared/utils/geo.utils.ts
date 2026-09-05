/**
 * High-accuracy Geographic distance and proximity helpers
 * FarmEx Logistics Engine
 */

/**
 * Calculates great-circle distance between two points on Earth using Haversine formula
 * @param lat1 Latitude of Point 1 in degrees
 * @param lon1 Longitude of Point 1 in degrees
 * @param lat2 Latitude of Point 2 in degrees
 * @param lon2 Longitude of Point 2 in degrees
 * @returns Distance in Kilometers rounded to 1 decimal place
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 999999;
  }

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
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

export interface DistanceBadge {
  distanceKm: number;
  formattedText: string;
  badgeType: 'VERY_NEAR' | 'NEAR' | 'MODERATE' | 'FAR' | 'UNKNOWN';
  badgeColor: 'emerald' | 'green' | 'amber' | 'slate' | 'neutral';
}

/**
 * Formats distance into a human-readable badge with tier
 */
export function getDistanceBadge(distanceKm: number | null | undefined): DistanceBadge {
  if (distanceKm === null || distanceKm === undefined || distanceKm >= 99999) {
    return {
      distanceKm: 99999,
      formattedText: 'Location not set',
      badgeType: 'UNKNOWN',
      badgeColor: 'neutral',
    };
  }

  if (distanceKm <= 5) {
    return {
      distanceKm,
      formattedText: `🟢 ${distanceKm} km (Nearby Village)`,
      badgeType: 'VERY_NEAR',
      badgeColor: 'emerald',
    };
  }

  if (distanceKm <= 20) {
    return {
      distanceKm,
      formattedText: `🟡 ${distanceKm} km (Same City/Tehsil)`,
      badgeType: 'NEAR',
      badgeColor: 'green',
    };
  }

  if (distanceKm <= 50) {
    return {
      distanceKm,
      formattedText: `🟠 ${distanceKm} km (District Hub)`,
      badgeType: 'MODERATE',
      badgeColor: 'amber',
    };
  }

  return {
    distanceKm,
    formattedText: `⚪ ${distanceKm} km away`,
    badgeType: 'FAR',
    badgeColor: 'slate',
  };
}
