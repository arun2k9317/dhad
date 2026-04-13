import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, IconButton, Searchbar, Text } from "react-native-paper";
import { usePrimaryBrandStatusBar } from "@/hooks/usePrimaryBrandStatusBar";
import { stitchColors } from "@/lib/theme";

const DISCOVER = [
  { label: "Bowls", emoji: "🥗" },
  { label: "Artisan", emoji: "🍕" },
  { label: "Sweets", emoji: "🥞" },
  { label: "Grill", emoji: "🥩" },
];

const EXPLORE_HERO_EXPANDED_PH = 288;
const EXPLORE_HERO_COLLAPSED_PH = 120;

function ExploreHero({
  collapsed,
  onCollapseToggle,
  onHeroMeasured,
  query,
  onQueryChange,
}: {
  collapsed: boolean;
  onCollapseToggle: () => void;
  onHeroMeasured?: (height: number) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const searchbar = (
    <Searchbar
      placeholder="Search dishes, chefs, cities…"
      value={query}
      onChangeText={onQueryChange}
      style={[styles.heroSearch, collapsed && styles.heroSearchCollapsedRow]}
      inputStyle={styles.heroSearchInput}
      iconColor={stitchColors.primary}
      elevation={0}
    />
  );

  if (collapsed) {
    return (
      <View
        style={styles.heroShell}
        onLayout={(e) => onHeroMeasured?.(e.nativeEvent.layout.height)}
      >
        <View style={styles.heroCollapsedInner}>
          {searchbar}
          <IconButton
            icon="chevron-down"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={onCollapseToggle}
            accessibilityLabel="Expand explore header"
            style={styles.heroChevronBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.heroShell}
      onLayout={(e) => onHeroMeasured?.(e.nativeEvent.layout.height)}
    >
      <View style={styles.hero}>
        <View style={styles.heroIconRing}>
          <MaterialCommunityIcons
            name="magnify"
            size={40}
            color={stitchColors.onPrimary}
          />
        </View>
        <Text variant="titleMedium" style={styles.heroTagline}>
          Search flavors, places, and people.
        </Text>
        {searchbar}
        <View style={styles.heroChevronRow}>
          <IconButton
            icon="chevron-up"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={onCollapseToggle}
            accessibilityLabel="Minimize explore header"
            style={styles.heroChevronBtn}
          />
        </View>
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  usePrimaryBrandStatusBar();
  const [query, setQuery] = useState("");
  const [heroHeight, setHeroHeight] = useState(EXPLORE_HERO_EXPANDED_PH);
  const [heroCollapsed, setHeroCollapsed] = useState(false);

  const handleHeroCollapseToggle = useCallback(() => {
    setHeroCollapsed((prev) => {
      const next = !prev;
      setHeroHeight(next ? EXPLORE_HERO_COLLAPSED_PH : EXPLORE_HERO_EXPANDED_PH);
      return next;
    });
  }, []);

  const floatingHero = (
    <View style={styles.heroFloatWrapper} pointerEvents="box-none">
      <ExploreHero
        collapsed={heroCollapsed}
        onCollapseToggle={handleHeroCollapseToggle}
        onHeroMeasured={setHeroHeight}
        query={query}
        onQueryChange={setQuery}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollFill}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: heroHeight }} />
        <View style={styles.belowHero}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Discover
          </Text>
          <View style={styles.chips}>
            {DISCOVER.map((d) => (
              <View key={d.label} style={styles.chip}>
                <Text style={styles.chipEmoji}>{d.emoji}</Text>
                <Text variant="labelSmall" style={styles.chipText}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Share a bite
              </Text>
              <Text variant="bodyMedium" style={styles.cardBody}>
                Search in the hero is demo-only for now. New posts are created from the
                Feed tab.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      {floatingHero}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stitchColors.background },
  heroFloatWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  heroShell: {
    backgroundColor: stitchColors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  hero: {
    backgroundColor: stitchColors.primary,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  heroCollapsedInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: stitchColors.primary,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 4,
    gap: 4,
  },
  heroIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTagline: {
    color: stitchColors.onPrimary,
    textAlign: "center",
    opacity: 0.95,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  heroSearch: {
    alignSelf: "stretch",
    width: "100%",
    maxWidth: 400,
    marginBottom: 0,
    borderRadius: 16,
    backgroundColor: stitchColors.surfaceContainerLowest,
  },
  heroSearchCollapsedRow: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    maxWidth: undefined,
  },
  heroSearchInput: {
    fontFamily: "PlusJakartaSans_400Regular",
    color: stitchColors.onSurface,
  },
  heroChevronRow: {
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 6,
    paddingBottom: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  heroChevronBtn: { margin: -6 },
  scrollFill: {
    flex: 1,
    backgroundColor: stitchColors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  belowHero: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 12,
  },
  sectionLabel: {
    color: stitchColors.primaryDim,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    width: 76,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: stitchColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: stitchColors.outlineVariant,
  },
  chipEmoji: { fontSize: 28, marginBottom: 4 },
  chipText: {
    color: stitchColors.onSurfaceVariant,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontSize: 10,
  },
  card: {
    borderRadius: 20,
    backgroundColor: stitchColors.surfaceContainerLow,
    marginTop: 8,
  },
  cardTitle: { fontWeight: "700", marginBottom: 8 },
  cardBody: { color: stitchColors.onSurfaceVariant },
});
