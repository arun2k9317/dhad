/** Haversine distance between two WGS84 points, in kilometers. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

export function mapRegionForRadiusKm(
  latitude: number,
  longitude: number,
  radiusKm: number
) {
  const latDelta = Math.max(0.015, (radiusKm / 111) * 2.5);
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  const lngDelta = cosLat > 0.01 ? latDelta / cosLat : latDelta;
  return {
    latitude,
    longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
