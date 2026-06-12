import type { StyleProp, ViewStyle } from "react-native";
import { DiscoveryRadiusOsmMap } from "@/components/DiscoveryRadiusOsmMap";

export type DiscoveryRadiusNativeMapProps = {
  mapContainerStyle: StyleProp<ViewStyle>;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  markerTitle: string;
  markerDescription: string;
  active?: boolean;
};

/** OpenStreetMap preview (Leaflet in WebView) — no Google Maps API key required. */
export function DiscoveryRadiusNativeMap({
  mapContainerStyle,
  centerLatitude,
  centerLongitude,
  radiusMeters,
  markerTitle,
  markerDescription,
  active = true,
}: DiscoveryRadiusNativeMapProps) {
  return (
    <DiscoveryRadiusOsmMap
      mapContainerStyle={mapContainerStyle}
      centerLatitude={centerLatitude}
      centerLongitude={centerLongitude}
      radiusMeters={radiusMeters}
      markerTitle={markerTitle}
      markerDescription={markerDescription}
      active={active}
    />
  );
}
