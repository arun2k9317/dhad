import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEMO_FALLBACK_COORDS } from "@/lib/demo-location-resolve";

export const DISCOVERY_RADIUS_MIN_KM = 1;
export const DISCOVERY_RADIUS_MAX_KM = 500;
/**
 * Default radius when no saved preference: wide enough for Kerala-wide demo seed
 * from the Kochi fallback anchor (~200 km covers Kochi–Trivandrum span).
 */
export const DEFAULT_DISCOVERY_RADIUS_KM = 220;

type PermissionState = "unknown" | "granted" | "denied";

type DiscoveryState = {
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  deviceLatitude: number | null;
  deviceLongitude: number | null;
  locationPermission: PermissionState;
  setDeviceCoords: (lat: number, lng: number) => void;
  setLocationPermission: (p: PermissionState) => void;
};

export function clampDiscoveryRadiusKm(km: number): number {
  return Math.min(
    DISCOVERY_RADIUS_MAX_KM,
    Math.max(DISCOVERY_RADIUS_MIN_KM, km)
  );
}

export function getDiscoveryCenterCoords(s: {
  deviceLatitude: number | null;
  deviceLongitude: number | null;
}): { latitude: number; longitude: number } {
  if (s.deviceLatitude != null && s.deviceLongitude != null) {
    return {
      latitude: s.deviceLatitude,
      longitude: s.deviceLongitude,
    };
  }
  return { ...DEMO_FALLBACK_COORDS };
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set) => ({
      radiusKm: DEFAULT_DISCOVERY_RADIUS_KM,
      setRadiusKm: (km) =>
        set({ radiusKm: clampDiscoveryRadiusKm(km) }),
      deviceLatitude: null,
      deviceLongitude: null,
      locationPermission: "unknown" as PermissionState,
      setDeviceCoords: (latitude, longitude) =>
        set({ deviceLatitude: latitude, deviceLongitude: longitude }),
      setLocationPermission: (locationPermission) => set({ locationPermission }),
    }),
    {
      name: "dhad-discovery",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ radiusKm: state.radiusKm }),
    }
  )
);
