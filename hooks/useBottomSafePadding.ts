import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Bottom padding for lists on stack screens (adds system nav inset). */
export function useBottomSafePadding(base = 24, enabled = true): number {
  const insets = useSafeAreaInsets();
  if (!enabled) return base;
  return base + Math.max(insets.bottom, 0);
}
