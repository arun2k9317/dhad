import { useMemo, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  TILE_PIXEL_SIZE,
  buildTileUrl,
  radiusCircleDiameterPx,
  tileGridOffset,
  tilesAroundPoint,
  zoomForRadiusKm,
} from "@/lib/osm-tile-map";
import { stitchColors } from "@/lib/theme";

export type DiscoveryRadiusOsmMapProps = {
  mapContainerStyle: StyleProp<ViewStyle>;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  markerTitle: string;
  markerDescription: string;
  active?: boolean;
};

const DEFAULT_LAYOUT = { width: 360, height: 232 };
const TILE_RING = 1;

export function DiscoveryRadiusOsmMap({
  mapContainerStyle,
  centerLatitude,
  centerLongitude,
  radiusMeters,
  active = true,
}: DiscoveryRadiusOsmMapProps) {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  const radiusKm = radiusMeters / 1000;
  const zoom = zoomForRadiusKm(radiusKm, centerLatitude, layout.width);
  const circlePx = radiusCircleDiameterPx(
    radiusMeters,
    centerLatitude,
    zoom
  );

  const tileGrid = useMemo(() => {
    const { tiles, gridSize } = tilesAroundPoint(
      centerLatitude,
      centerLongitude,
      zoom,
      TILE_RING
    );
    const offset = tileGridOffset(
      centerLatitude,
      centerLongitude,
      zoom,
      TILE_RING,
      layout.width,
      layout.height
    );
    return { tiles, gridSize, offset };
  }, [centerLatitude, centerLongitude, zoom, layout.width, layout.height]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayout({ width, height });
    }
  };

  if (!active) {
    return null;
  }

  const gridPx = tileGrid.gridSize * TILE_PIXEL_SIZE;

  return (
    <View
      style={[mapContainerStyle, styles.container]}
      onLayout={onLayout}
      accessibilityLabel="Discovery radius map preview"
    >
      <View style={styles.tileClip}>
        <View
          style={[
            styles.tileGrid,
            {
              width: gridPx,
              height: gridPx,
              transform: [
                { translateX: tileGrid.offset.translateX },
                { translateY: tileGrid.offset.translateY },
              ],
            },
          ]}
        >
          {tileGrid.tiles.map((tile) => (
            <Image
              key={tile.key}
              source={{ uri: buildTileUrl(tile.x, tile.y, zoom) }}
              style={styles.tile}
              resizeMode="cover"
            />
          ))}
        </View>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.radiusRing,
          {
            width: circlePx,
            height: circlePx,
            borderRadius: circlePx / 2,
            marginTop: -circlePx / 2,
            marginLeft: -circlePx / 2,
          },
        ]}
      />
      <View pointerEvents="none" style={styles.centerDot} />

      <Text style={styles.attribution} pointerEvents="none">
        © OpenStreetMap · © CARTO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: stitchColors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  tileClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tile: {
    width: TILE_PIXEL_SIZE,
    height: TILE_PIXEL_SIZE,
  },
  radiusRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    borderWidth: 2,
    borderColor: stitchColors.primary,
    backgroundColor: "rgba(161, 57, 0, 0.14)",
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 10,
    height: 10,
    marginTop: -5,
    marginLeft: -5,
    borderRadius: 5,
    backgroundColor: stitchColors.primary,
    borderWidth: 2,
    borderColor: stitchColors.onPrimary,
  },
  attribution: {
    position: "absolute",
    bottom: 4,
    right: 6,
    fontSize: 9,
    color: stitchColors.onSurfaceVariant,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: "hidden",
  },
});
