import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Text } from "react-native-paper";
import { usePrimaryBrandStatusBar } from "@/hooks/usePrimaryBrandStatusBar";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";

export default function ProfileScreen() {
  usePrimaryBrandStatusBar();

  const userId = demoApi.getCurrentUserId();
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => demoApi.fetchProfile(userId),
  });

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text>Could not load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <Avatar.Image
            size={96}
            style={styles.avatar}
            source={{ uri: data.avatar_url }}
          />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileBlock}>
          <Card style={styles.card} mode="elevated" elevation={3}>
            <Card.Content style={styles.content}>
              <Text variant="headlineSmall" style={styles.username}>
                @{data.username}
              </Text>
              <View style={styles.badge}>
                <Text variant="labelLarge" style={styles.badgeText}>
                  Reputation {data.reputation_score}
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.bio}>
                {data.bio}
              </Text>
              <Text variant="bodySmall" style={styles.note}>
                Demo profile from JSON seed — swap for Supabase when ready.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stitchColors.background },
  /** Continues from primary header — flat top, rounded bottom. */
  hero: {
    backgroundColor: stitchColors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 56,
    backgroundColor: stitchColors.surfaceContainerLowest,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatar: { backgroundColor: stitchColors.surfaceContainerHighest },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileBlock: {
    alignItems: "center",
    width: "100%",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderRadius: 24,
    backgroundColor: stitchColors.surfaceContainerLowest,
  },
  content: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 22,
  },
  username: { fontWeight: "700" },
  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: stitchColors.secondaryContainer,
  },
  badgeText: { color: stitchColors.onSecondaryContainer, fontWeight: "600" },
  bio: { marginTop: 16, textAlign: "center", lineHeight: 22 },
  note: { marginTop: 20, opacity: 0.55, textAlign: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
