import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import {
  stitchColors,
  navigationHeaderOptions,
  primaryBrandHeaderOptions,
} from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...navigationHeaderOptions,
        headerShown: true,
        tabBarActiveTintColor: stitchColors.tabActivePill,
        tabBarInactiveTintColor: "#a8a29e",
        tabBarStyle: {
          backgroundColor: stitchColors.tabBarBg,
          borderTopWidth: 0,
          borderTopLeftRadius: 48,
          borderTopRightRadius: 48,
          paddingTop: 8,
          paddingBottom: 4,
          shadowColor: "rgba(50, 46, 43, 0.08)",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 1,
          shadowRadius: 25,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans_700Bold",
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "DHAD",
          tabBarLabel: "Feed",
          ...primaryBrandHeaderOptions,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "DHAD",
          tabBarLabel: "Explore",
          ...primaryBrandHeaderOptions,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="meetups"
        options={{
          title: "DHAD",
          tabBarLabel: "Meetups",
          ...primaryBrandHeaderOptions,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "DHAD",
          tabBarLabel: "Account",
          ...primaryBrandHeaderOptions,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: null,
          title: "New post",
        }}
      />
    </Tabs>
  );
}
