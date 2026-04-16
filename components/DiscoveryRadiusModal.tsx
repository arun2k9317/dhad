import Slider from "@react-native-community/slider";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { DiscoveryRadiusNativeMap } from "@/components/DiscoveryRadiusNativeMap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRefreshDiscoveryLocation } from "@/hooks/useDiscoveryLocation";
import { mapRegionForRadiusKm } from "@/lib/geo";
import { stitchColors } from "@/lib/theme";
import {
  clampDiscoveryRadiusKm,
  DISCOVERY_RADIUS_MAX_KM,
  DISCOVERY_RADIUS_MIN_KM,
  getDiscoveryCenterCoords,
  useDiscoveryStore,
} from "@/stores/discovery-store";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function DiscoveryRadiusModal({ visible, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const refreshLocation = useRefreshDiscoveryLocation();
  const radiusKm = useDiscoveryStore((s) => s.radiusKm);
  const setRadiusKm = useDiscoveryStore((s) => s.setRadiusKm);
  const deviceLatitude = useDiscoveryStore((s) => s.deviceLatitude);
  const deviceLongitude = useDiscoveryStore((s) => s.deviceLongitude);
  const locationPermission = useDiscoveryStore((s) => s.locationPermission);

  const center = getDiscoveryCenterCoords({
    deviceLatitude,
    deviceLongitude,
  });

  useEffect(() => {
    if (visible) {
      void refreshLocation();
    }
  }, [visible, refreshLocation]);

  const region = mapRegionForRadiusKm(
    center.latitude,
    center.longitude,
    radiusKm
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <Text variant="titleMedium" style={styles.sheetTitle}>
                Discovery radius
              </Text>
              <Text variant="bodySmall" style={styles.sheetSubtitle}>
                Posts and meetups within this distance appear in your feed and
                meetups list.
              </Text>
            </View>
            <IconButton icon="close" size={22} onPress={onDismiss} />
          </View>

          <DiscoveryRadiusNativeMap
            mapContainerStyle={styles.map}
            region={region}
            showsUserLocation={locationPermission === "granted"}
            centerLatitude={center.latitude}
            centerLongitude={center.longitude}
            radiusMeters={radiusKm * 1000}
            markerTitle="Discovery center"
            markerDescription={
              deviceLatitude != null
                ? "Your location"
                : "Demo anchor (enable location for GPS)"
            }
          />

          <View style={styles.sliderBlock}>
            <View style={styles.sliderLabels}>
              <Text variant="labelLarge" style={styles.kmValue}>
                {Math.round(radiusKm)} km
              </Text>
              <Text variant="bodySmall" style={styles.sliderHint}>
                {DISCOVERY_RADIUS_MIN_KM}–{DISCOVERY_RADIUS_MAX_KM} km
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={DISCOVERY_RADIUS_MIN_KM}
              maximumValue={DISCOVERY_RADIUS_MAX_KM}
              step={1}
              value={radiusKm}
              onValueChange={(v) => setRadiusKm(clampDiscoveryRadiusKm(v))}
              minimumTrackTintColor={stitchColors.primary}
              maximumTrackTintColor={stitchColors.surfaceContainerHigh}
              thumbTintColor={stitchColors.primary}
            />
            <Text variant="bodySmall" style={styles.locationHint}>
              {deviceLatitude != null
                ? "Using your device location as the center."
                : locationPermission === "denied"
                  ? "Location off — using a demo map anchor (Kochi, Kerala). Enable location in settings for GPS."
                  : "Locating… If GPS is unavailable, we use a demo anchor."}
            </Text>
          </View>

          <Button mode="contained" onPress={onDismiss} style={styles.doneBtn}>
            Done
          </Button>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(50, 46, 43, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: stitchColors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: "92%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  sheetTitleBlock: { flex: 1, minWidth: 0, paddingRight: 4 },
  sheetTitle: {
    color: stitchColors.onSurface,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    color: stitchColors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  map: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
  },
  sliderBlock: { marginTop: 12 },
  sliderLabels: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  kmValue: {
    color: stitchColors.primary,
    fontWeight: "700",
  },
  sliderHint: { color: stitchColors.onSurfaceVariant, opacity: 0.85 },
  slider: { width: "100%", height: 44 },
  locationHint: {
    marginTop: 8,
    color: stitchColors.onSurfaceVariant,
    lineHeight: 18,
  },
  doneBtn: { marginTop: 8, borderRadius: 12 },
});
