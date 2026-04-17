import Slider from "@react-native-community/slider";
import { useEffect } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { Button, IconButton, Surface, Text } from "react-native-paper";
import { DiscoveryRadiusNativeMap } from "@/components/DiscoveryRadiusNativeMap";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRefreshDiscoveryLocation } from "@/hooks/useDiscoveryLocation";
import { mapRegionForRadiusKm } from "@/lib/geo";
import { editorialCardShadow, stitchColors } from "@/lib/theme";
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
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.dim} pointerEvents="none" />
        <Surface
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 12,
              paddingTop: 10,
            },
          ]}
          elevation={5}
        >
          <View style={styles.handle} accessible={false} importantForAccessibility="no" />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <Text variant="labelSmall" style={styles.overline}>
                Nearby content
              </Text>
              <Text variant="titleLarge" style={styles.sheetTitle}>
                Discovery radius
              </Text>
              <Text variant="bodyMedium" style={styles.sheetSubtitle}>
                Only posts and meetups within this distance from your map center
                appear in Feed and Meetups.
              </Text>
            </View>
            <IconButton
              icon="close"
              mode="contained-tonal"
              size={22}
              onPress={onDismiss}
              accessibilityLabel="Close discovery radius"
              style={styles.closeBtn}
              containerColor={stitchColors.surfaceContainerHigh}
              iconColor={stitchColors.onSurfaceVariant}
            />
          </View>

          <View style={styles.mapCard}>
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
          </View>

          <Surface style={styles.sliderCard} elevation={0}>
            <View style={styles.sliderHeader}>
              <Text style={styles.radiusValue}>{Math.round(radiusKm)} km</Text>
              <Text variant="bodySmall" style={styles.sliderRangeLabel}>
                Range {DISCOVERY_RADIUS_MIN_KM}–{DISCOVERY_RADIUS_MAX_KM} km
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
              maximumTrackTintColor={stitchColors.outlineVariant}
              thumbTintColor={stitchColors.primary}
            />
            <Text variant="bodySmall" style={styles.locationHint}>
              {deviceLatitude != null
                ? "Center: your device location."
                : locationPermission === "denied"
                  ? "Center: demo anchor (Kochi, Kerala). Enable location in settings to use GPS."
                  : "Locating… If GPS is unavailable, we use a demo anchor."}
            </Text>
          </Surface>

          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.doneBtn}
            contentStyle={styles.doneBtnContent}
            labelStyle={styles.doneLabel}
          >
            Done
          </Button>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  /** Dimmed area is non-interactive — taps do not dismiss (avoids accidental close while using the slider). */
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(32, 28, 26, 0.52)",
  },
  sheet: {
    backgroundColor: stitchColors.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    maxHeight: "92%",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: stitchColors.outlineVariant,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: stitchColors.outlineVariant,
    marginBottom: 14,
    opacity: 0.85,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  sheetTitleBlock: { flex: 1, minWidth: 0, paddingRight: 4 },
  overline: {
    color: stitchColors.primary,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
    opacity: 0.92,
  },
  sheetTitle: {
    color: stitchColors.onSurface,
    fontWeight: "700",
    letterSpacing: -0.35,
    marginBottom: 6,
  },
  sheetSubtitle: {
    color: stitchColors.onSurfaceVariant,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  closeBtn: { margin: 0, marginTop: -2 },
  mapCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: stitchColors.outlineVariant,
    backgroundColor: stitchColors.surfaceContainer,
    ...editorialCardShadow,
  },
  map: {
    width: "100%",
    height: 232,
    borderRadius: 16,
    overflow: "hidden",
  },
  sliderCard: {
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: stitchColors.surfaceContainer,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: stitchColors.outlineVariant,
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  radiusValue: {
    fontSize: 26,
    fontWeight: "700",
    color: stitchColors.primary,
    letterSpacing: -0.5,
  },
  sliderRangeLabel: {
    color: stitchColors.onSurfaceVariant,
    opacity: 0.88,
  },
  slider: {
    width: "100%",
    height: 48,
    marginVertical: 4,
  },
  locationHint: {
    marginTop: 10,
    color: stitchColors.onSurfaceVariant,
    lineHeight: 20,
    opacity: 0.95,
  },
  doneBtn: {
    marginTop: 16,
    borderRadius: 14,
    alignSelf: "stretch",
  },
  doneBtnContent: { paddingVertical: 8 },
  doneLabel: { fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
});
