import * as Location from "expo-location";
import { useCallback } from "react";
import { useDiscoveryStore } from "@/stores/discovery-store";

/** Requests foreground permission and stores device coordinates for discovery filtering. */
export function useRefreshDiscoveryLocation() {
  const setDeviceCoords = useDiscoveryStore((s) => s.setDeviceCoords);
  const setLocationPermission = useDiscoveryStore((s) => s.setLocationPermission);

  return useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationPermission("denied");
      return;
    }
    setLocationPermission("granted");
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setDeviceCoords(pos.coords.latitude, pos.coords.longitude);
  }, [setDeviceCoords, setLocationPermission]);
}
