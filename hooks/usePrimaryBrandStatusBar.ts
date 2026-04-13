import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Platform, StatusBar } from "react-native";
import { stitchColors } from "@/lib/theme";

/** Light status bar + Android bar color for screens under the solid primary header. */
export function usePrimaryBrandStatusBar() {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("light-content", true);
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor(stitchColors.primary, true);
      }
      return () => {
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("transparent", true);
        }
      };
    }, [])
  );
}
