import { Text, type StyleProp, type TextStyle } from "react-native";
import { fontFamilyDhadBrand, stitchColors } from "@/lib/theme";

type Props = {
  /** Base size; `compact` caps height for collapsed heroes. */
  size?: number;
  color?: string;
  compact?: boolean;
  style?: StyleProp<TextStyle>;
};

export function DhadHeroWordmark({
  size = 40,
  color = stitchColors.onPrimary,
  compact = false,
  style,
}: Props) {
  const fontSize = compact ? Math.min(22, size) : size;
  return (
    <Text
      style={[{ fontFamily: fontFamilyDhadBrand, fontSize, color }, style]}
      accessibilityRole="header"
      accessibilityLabel="DHAD"
    >
      DHAD
    </Text>
  );
}
