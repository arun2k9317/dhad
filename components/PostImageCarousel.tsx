import { useCallback, useEffect, useState } from "react";
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import { stitchColors } from "@/lib/theme";

type Props = {
  uris: string[];
  /** Horizontal inset from screen edges (e.g. list padding 12 → 24 total). */
  horizontalInset?: number;
  aspectRatio?: number;
};

export function PostImageCarousel({
  uris,
  horizontalInset = 0,
  aspectRatio = 1,
}: Props) {
  const { width: windowW } = useWindowDimensions();
  const slideW = windowW - horizontalInset;
  const height = slideW / aspectRatio;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [uris]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / slideW);
      setPage(Math.min(Math.max(0, i), Math.max(0, uris.length - 1)));
    },
    [slideW, uris.length]
  );

  if (uris.length === 0) {
    return (
      <View style={[styles.fallback, { width: slideW, height }]}>
        <Text variant="bodySmall" style={styles.fallbackText}>
          No images
        </Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        decelerationRate="fast"
      >
        {uris.map((uri, i) => (
          <Image
            key={`${uri}-${i}`}
            source={{ uri }}
            style={{ width: slideW, height }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {uris.length > 1 ? (
        <View style={styles.footer}>
          <View style={styles.dots}>
            {uris.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === page && styles.dotActive]}
              />
            ))}
          </View>
          <Text variant="labelSmall" style={styles.counter}>
            {page + 1} / {uris.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: stitchColors.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: { color: stitchColors.onSurfaceVariant },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dots: { flexDirection: "row", gap: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: stitchColors.outlineVariant,
  },
  dotActive: {
    backgroundColor: stitchColors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counter: {
    color: stitchColors.onSurfaceVariant,
    fontWeight: "600",
    opacity: 0.85,
  },
});
