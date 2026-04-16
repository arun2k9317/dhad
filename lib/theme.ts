import {
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from "react-native-paper";

/**
 * Tokens from Stitch Tailwind config (Design System HTML).
 * Plus Jakarta Sans is loaded in `app/_layout.tsx` and applied via Paper theme fonts.
 */
export const stitchColors = {
  primary: "#a13900",
  onPrimary: "#ffefea",
  primaryContainer: "#ff793e",
  onPrimaryContainer: "#431300",
  primaryDim: "#8d3100",
  secondary: "#785500",
  onSecondary: "#fff1de",
  secondaryContainer: "#ffc965",
  onSecondaryContainer: "#5f4200",
  tertiary: "#b5161e",
  onTertiary: "#ffefed",
  tertiaryContainer: "#ff9289",
  onTertiaryContainer: "#690008",
  background: "#fef5f0",
  surface: "#fef5f0",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f8efea",
  surfaceContainer: "#f0e6e1",
  surfaceContainerHigh: "#eae1db",
  surfaceContainerHighest: "#e5dbd5",
  surfaceVariant: "#e5dbd5",
  onSurface: "#322e2b",
  onSurfaceVariant: "#605a57",
  onBackground: "#322e2b",
  outline: "#7c7672",
  outlineVariant: "#b3aca7",
  error: "#b31b25",
  /** Tailwind orange-600 — bottom nav active pill */
  tabActivePill: "#ea580c",
  /** orange-50 */
  headerBar: "rgba(255, 247, 237, 0.95)",
  tabBarBg: "rgba(255, 247, 237, 0.95)",
  stone900: "#1c1917",
  orange700: "#c2410c",
  /** Demo strip (not in Stitch — subtle teal) */
  infoBannerBg: "#e8f4f2",
  infoBannerText: "#0d5c4d",
} as const;

/**
 * `FoodCraft` — loaded in `app/_layout.tsx` from `assets/fonts/food_craft.ttf`.
 * Use for the DHAD title on primary (orange) tab headers.
 */
export const fontFamilyDhadBrand = "FoodCraft";

/** @deprecated Use stitchColors — kept for gradual migration */
export const appColors = stitchColors;

const fonts = configureFonts({
  config: { fontFamily: "PlusJakartaSans_400Regular" },
  isV3: true,
});

export const vibrantTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: stitchColors.primary,
    onPrimary: stitchColors.onPrimary,
    primaryContainer: stitchColors.primaryContainer,
    onPrimaryContainer: stitchColors.onPrimaryContainer,
    secondary: stitchColors.secondary,
    onSecondary: stitchColors.onSecondary,
    secondaryContainer: stitchColors.secondaryContainer,
    onSecondaryContainer: stitchColors.onSecondaryContainer,
    tertiary: stitchColors.tertiary,
    onTertiary: stitchColors.onTertiary,
    tertiaryContainer: stitchColors.tertiaryContainer,
    onTertiaryContainer: stitchColors.onTertiaryContainer,
    background: stitchColors.background,
    surface: stitchColors.surface,
    surfaceVariant: stitchColors.surfaceVariant,
    onSurface: stitchColors.onSurface,
    onSurfaceVariant: stitchColors.onSurfaceVariant,
    outline: stitchColors.outline,
    error: stitchColors.error,
  },
};

/** Frosted top bar like Stitch (`bg-orange-50/80`). */
export const navigationHeaderOptions = {
  headerStyle: {
    backgroundColor: stitchColors.headerBar,
    borderBottomWidth: 0,
    shadowColor: "rgba(50, 46, 43, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  headerTintColor: stitchColors.orange700,
  headerTitleStyle: {
    color: stitchColors.stone900,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  } as const,
  headerShadowVisible: false,
} as const;

/** Solid primary header — flows into Account profile hero (same orange). */
export const primaryBrandHeaderOptions = {
  headerStyle: {
    backgroundColor: stitchColors.primary,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: stitchColors.onPrimary,
  headerTitleStyle: {
    color: stitchColors.onPrimary,
    letterSpacing: 0.5,
    fontFamily: fontFamilyDhadBrand,
    fontSize: 22,
  } as const,
  headerShadowVisible: false,
} as const;

export const editorialCardShadow = {
  shadowColor: "rgba(50, 46, 43, 0.08)",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 25,
  elevation: 4,
};
