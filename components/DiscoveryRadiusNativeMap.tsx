import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
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

/** Web (and non-native): no `react-native-maps` — radar-style placeholder. */
export function DiscoveryRadiusNativeMap({
  mapContainerStyle,
}: DiscoveryRadiusNativeMapProps) {
  return (
    <View style={[mapContainerStyle, styles.mapFallback]}>
      <View style={styles.radarRingOuter} />
      <View style={styles.radarRingMid} />
      <View style={styles.radarRingInner} />
      <Text variant="bodySmall" style={styles.mapFallbackCaption}>
        Live map with radius ring is available on iOS and Android. Adjust the
        slider to set your discovery radius.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapFallback: {
    backgroundColor: stitchColors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  radarRingOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(161, 57, 0, 0.25)",
  },
  radarRingMid: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "rgba(161, 57, 0, 0.4)",
  },
  radarRingInner: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: stitchColors.primaryContainer,
    opacity: 0.85,
  },
  mapFallbackCaption: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    textAlign: "center",
    color: stitchColors.onSurfaceVariant,
  },
});
