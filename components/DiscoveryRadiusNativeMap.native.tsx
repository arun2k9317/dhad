import type { StyleProp, ViewStyle } from "react-native";
import MapView from "react-native-maps/lib/MapView.js";
import Circle from "react-native-maps/lib/MapCircle.js";
import Marker from "react-native-maps/lib/MapMarker.js";
import { stitchColors } from "@/lib/theme";

export type DiscoveryRadiusNativeMapProps = {
  mapContainerStyle: StyleProp<ViewStyle>;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation: boolean;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  markerTitle: string;
  markerDescription: string;
};

/** iOS / Android only — imports maps via `lib/*.js` to avoid Metro failing on package `index.js`. */
export function DiscoveryRadiusNativeMap({
  mapContainerStyle,
  region,
  showsUserLocation,
  centerLatitude,
  centerLongitude,
  radiusMeters,
  markerTitle,
  markerDescription,
}: DiscoveryRadiusNativeMapProps) {
  return (
    <MapView
      style={mapContainerStyle}
      region={region}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
    >
      <Marker
        coordinate={{
          latitude: centerLatitude,
          longitude: centerLongitude,
        }}
        title={markerTitle}
        description={markerDescription}
      />
      <Circle
        center={{
          latitude: centerLatitude,
          longitude: centerLongitude,
        }}
        radius={radiusMeters}
        strokeColor={stitchColors.primary}
        strokeWidth={2}
        fillColor="rgba(161, 57, 0, 0.14)"
      />
    </MapView>
  );
}
