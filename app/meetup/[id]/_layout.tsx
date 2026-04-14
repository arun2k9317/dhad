import { Stack } from "expo-router";
import { navigationHeaderOptions, stitchColors } from "@/lib/theme";

export default function MeetupIdLayout() {
  return (
    <Stack
      screenOptions={{
        ...navigationHeaderOptions,
        contentStyle: { backgroundColor: stitchColors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Meetup" }} />
      <Stack.Screen name="chat" options={{ title: "Group chat" }} />
    </Stack>
  );
}
