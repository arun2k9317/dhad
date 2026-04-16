import { haversineKm } from "@/lib/geo";

export function isWithinDiscoveryRadius(
  itemLat: number,
  itemLng: number,
  center: { latitude: number; longitude: number },
  radiusKm: number
): boolean {
  return (
    haversineKm(center.latitude, center.longitude, itemLat, itemLng) <= radiusKm
  );
}
