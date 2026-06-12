import { forwardRef } from "react";
import {
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SafeAreaScrollViewProps = ScrollViewProps & {
  /** Extra padding when no paddingBottom is set on contentContainerStyle (default 16). */
  extraBottomPadding?: number;
  /** When false, only style padding applies (tab screens — tab bar handles system inset). */
  bottomInset?: boolean;
};

function resolvePaddingBottom(
  style: StyleProp<ViewStyle>,
  fallback: number
): number {
  const flat = StyleSheet.flatten(style);
  return typeof flat?.paddingBottom === "number" ? flat.paddingBottom : fallback;
}

export const SafeAreaScrollView = forwardRef<ScrollView, SafeAreaScrollViewProps>(
  function SafeAreaScrollView(
    {
      contentContainerStyle,
      extraBottomPadding = 16,
      bottomInset = true,
      ...props
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const basePadding = resolvePaddingBottom(
      contentContainerStyle,
      extraBottomPadding
    );
    const inset = bottomInset ? Math.max(insets.bottom, 0) : 0;

    return (
      <ScrollView
        ref={ref}
        {...props}
        contentContainerStyle={[
          contentContainerStyle,
          { paddingBottom: basePadding + inset },
        ]}
      />
    );
  }
);
