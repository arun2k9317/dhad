import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { DiscoveryRadiusModal } from "@/components/DiscoveryRadiusModal";
import { PostImageCarousel } from "@/components/PostImageCarousel";
import {
  ActivityIndicator,
  Avatar,
  Card,
  IconButton,
  Text,
} from "react-native-paper";
import { usePrimaryBrandStatusBar } from "@/hooks/usePrimaryBrandStatusBar";
import { editorialCardShadow, stitchColors } from "@/lib/theme";
import { useRefreshDiscoveryLocation } from "@/hooks/useDiscoveryLocation";
import { isWithinDiscoveryRadius } from "@/lib/discovery-filter";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
import {
  getDiscoveryCenterCoords,
  useDiscoveryStore,
} from "@/stores/discovery-store";
import type { PostWithMeta } from "@/types/demo";

const STORIES: { id: string; label: string; emoji?: string }[] = [
  { id: "post", label: "Post" },
  { id: "bowls", label: "Bowls", emoji: "🥗" },
  { id: "artisan", label: "Artisan", emoji: "🍕" },
  { id: "sweets", label: "Sweets", emoji: "🥞" },
  { id: "grill", label: "Grill", emoji: "🥩" },
];

const FEED_HERO_PLACEHOLDER_H = 188;
const FEED_HERO_COLLAPSED_PLACEHOLDER_H = 44;

function FeedHeroStories({
  collapsed,
  onCollapseToggle,
  onHeroMeasured,
}: {
  collapsed: boolean;
  onCollapseToggle: () => void;
  onHeroMeasured?: (height: number) => void;
}) {
  if (collapsed) {
    return (
      <View
        style={styles.heroShell}
        onLayout={(e) => onHeroMeasured?.(e.nativeEvent.layout.height)}
      >
        <View style={styles.heroCollapsedBar}>
          <IconButton
            icon="chevron-down"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={onCollapseToggle}
            accessibilityLabel="Expand feed shortcuts"
            style={styles.heroChevronBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.heroShell}
      onLayout={(e) => onHeroMeasured?.(e.nativeEvent.layout.height)}
    >
      <View style={styles.hero}>
        <Text variant="titleMedium" style={styles.heroTagline}>
          What’s cooking nearby
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storyScroll}
        >
          {STORIES.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => {
                if (s.id === "post") router.push("/(tabs)/create");
              }}
              style={styles.storyItem}
            >
              <View
                style={[
                  styles.storyRing,
                  s.id === "post" && styles.storyRingPrimary,
                  s.id !== "post" && styles.storyRingSecondary,
                ]}
              >
                {s.id === "post" ? (
                  <View style={styles.storyAddInner}>
                    <Text variant="headlineSmall" style={styles.storyAddIcon}>
                      +
                    </Text>
                  </View>
                ) : (
                  <View style={styles.storyEmojiInner}>
                    <RNText style={styles.storyEmoji}>{s.emoji}</RNText>
                  </View>
                )}
              </View>
              <Text variant="labelSmall" style={styles.storyLabel}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.heroChevronRow}>
          <IconButton
            icon="chevron-up"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={onCollapseToggle}
            accessibilityLabel="Minimize feed shortcuts"
            style={styles.heroChevronBtn}
          />
        </View>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  usePrimaryBrandStatusBar();
  const [heroHeight, setHeroHeight] = useState(FEED_HERO_PLACEHOLDER_H);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const [discoveryRadiusOpen, setDiscoveryRadiusOpen] = useState(false);
  const navigation = useNavigation();
  const refreshDiscoveryLocation = useRefreshDiscoveryLocation();
  const radiusKm = useDiscoveryStore((s) => s.radiusKm);
  const deviceLatitude = useDiscoveryStore((s) => s.deviceLatitude);
  const deviceLongitude = useDiscoveryStore((s) => s.deviceLongitude);

  const discoveryCenter = useMemo(
    () => getDiscoveryCenterCoords({ deviceLatitude, deviceLongitude }),
    [deviceLatitude, deviceLongitude]
  );

  useEffect(() => {
    void refreshDiscoveryLocation();
  }, [refreshDiscoveryLocation]);

  const handleHeroCollapseToggle = useCallback(() => {
    setHeroCollapsed((prev) => {
      const next = !prev;
      setHeroHeight(next ? FEED_HERO_COLLAPSED_PLACEHOLDER_H : FEED_HERO_PLACEHOLDER_H);
      return next;
    });
  }, []);
  const queryClient = useQueryClient();
  const userId = demoApi.getCurrentUserId();
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => demoApi.fetchProfile(userId),
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notificationUnread,
    queryFn: () => demoApi.getUnreadNotificationCount(),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <View style={styles.headerRightCluster}>
          <IconButton
            icon="radar"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={() => setDiscoveryRadiusOpen(true)}
            accessibilityLabel={`Discovery radius, ${Math.round(radiusKm)} kilometers`}
            style={styles.headerRadarBtn}
          />
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            accessibilityRole="button"
            accessibilityLabel="Account and notifications"
            style={styles.headerRightAvatarPress}
          >
            <View style={styles.headerAvatarWrap}>
              {profile?.avatar_url ? (
                <Avatar.Image
                  size={40}
                  source={{ uri: profile.avatar_url }}
                  style={styles.headerAvatarRight}
                />
              ) : (
                <Avatar.Icon
                  size={40}
                  icon="account"
                  style={styles.headerAvatarPlaceholder}
                />
              )}
              {unreadCount > 0 ? (
                <View style={styles.notifBadge} pointerEvents="none">
                  <RNText style={styles.notifBadgeText}>
                    {unreadCount > 9 ? "9+" : String(unreadCount)}
                  </RNText>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, profile?.avatar_url, unreadCount, radiusKm]);

  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.posts,
    queryFn: demoApi.fetchFeedPosts,
  });

  const filteredPosts = useMemo(() => {
    if (!data?.length) return [];
    return data.filter((p) =>
      isWithinDiscoveryRadius(
        p.latitude,
        p.longitude,
        discoveryCenter,
        radiusKm
      )
    );
  }, [data, discoveryCenter, radiusKm]);

  const likeMutation = useMutation({
    mutationFn: (postId: string) => demoApi.toggleLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts });
      const previous = queryClient.getQueryData<PostWithMeta[]>(queryKeys.posts);
      queryClient.setQueryData<PostWithMeta[]>(queryKeys.posts, (old) => {
        if (!old) return old;
        return old.map((p) => {
          if (p.id !== postId) return p;
          const nextLiked = !p.likedByMe;
          return {
            ...p,
            likedByMe: nextLiked,
            likeCount: p.likeCount + (nextLiked ? 1 : -1),
          };
        });
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.posts, ctx.previous);
      }
    },
    onSettled: (_d, _e, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: PostWithMeta }) => (
      <Card
        style={styles.card}
        mode="contained"
        onPress={() => router.push(`/post/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Avatar.Image size={44} source={{ uri: item.author?.avatar_url }} />
          <View style={styles.headerText}>
            <Text variant="titleSmall" style={styles.authorName}>
              {item.author?.username ?? "Unknown"}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              {item.location} · {formatRelative(item.created_at)}
            </Text>
          </View>
        </View>
        <PostImageCarousel uris={item.image_urls} horizontalInset={24} />
        <Card.Content style={styles.cardContent}>
          <View style={styles.actions}>
            <IconButton
              icon={item.likedByMe ? "heart" : "heart-outline"}
              iconColor={item.likedByMe ? stitchColors.tertiary : undefined}
              size={26}
              onPress={() => likeMutation.mutate(item.id)}
            />
            <Text variant="bodyMedium" style={styles.likeCount}>
              {item.likeCount} likes
            </Text>
            <Text variant="bodySmall" style={styles.commentHint}>
              {item.commentCount} comments
            </Text>
          </View>
          <Text variant="bodyMedium">{item.caption}</Text>
        </Card.Content>
      </Card>
    ),
    [likeMutation]
  );

  const listHeader = useMemo(
    () => (
      <View>
        <View style={{ height: heroHeight }} />
        <View style={styles.demoStrip}>
          <Text variant="labelMedium" style={styles.demoStripText}>
            Demo data · edit data/demo.json
          </Text>
        </View>
      </View>
    ),
    [heroHeight]
  );

  const floatingHero = (
    <View style={styles.heroFloatWrapper} pointerEvents="box-none">
      <FeedHeroStories
        collapsed={heroCollapsed}
        onCollapseToggle={handleHeroCollapseToggle}
        onHeroMeasured={setHeroHeight}
      />
    </View>
  );

  if (isPending) {
    return (
      <View style={styles.screen}>
        <View style={[styles.feedList, { paddingTop: heroHeight }]}>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={stitchColors.primary} />
          </View>
        </View>
        {floatingHero}
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <View style={[styles.feedList, { paddingTop: heroHeight }]}>
          <View style={styles.centered}>
            <Text>Could not load feed.</Text>
          </View>
        </View>
        {floatingHero}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        style={styles.feedList}
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          data && data.length > 0 ? (
            <View style={styles.discoveryEmpty}>
              <Text variant="bodyLarge" style={styles.discoveryEmptyTitle}>
                Nothing in range
              </Text>
              <Text variant="bodyMedium" style={styles.discoveryEmptyBody}>
                No posts within {Math.round(radiusKm)} km of your discovery
                center. Open discovery radius (radar icon) and widen the radius,
                or move closer to where people are posting.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      />
      <DiscoveryRadiusModal
        visible={discoveryRadiusOpen}
        onDismiss={() => setDiscoveryRadiusOpen(false)}
      />
      {floatingHero}
    </View>
  );
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return h <= 0 ? "just now" : `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stitchColors.background },
  /** List scrolls full-screen; hero draws on top so feed moves under the orange band. */
  heroFloatWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  /** Clips rounded hero; lives in the floating layer above the list. */
  heroShell: {
    backgroundColor: stitchColors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  feedList: {
    flex: 1,
    backgroundColor: stitchColors.background,
  },
  headerRightCluster: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 2,
  },
  headerRadarBtn: { margin: 0 },
  headerRightAvatarPress: {
    marginRight: 4,
    paddingVertical: 2,
    paddingLeft: 4,
  },
  discoveryEmpty: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  discoveryEmptyTitle: {
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  discoveryEmptyBody: {
    textAlign: "center",
    color: stitchColors.onSurfaceVariant,
    lineHeight: 22,
  },
  /** Sized to avatar (40); badge overflows — avoids extra inset that showed a white ring in the corner. */
  headerAvatarWrap: {
    position: "relative",
    width: 40,
    height: 40,
    overflow: "visible",
  },
  headerAvatarRight: {
    borderWidth: 1,
    borderColor: "rgba(255, 239, 234, 0.45)",
    backgroundColor: stitchColors.primary,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  headerAvatarPlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 239, 234, 0.45)",
    elevation: 0,
    shadowOpacity: 0,
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: stitchColors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.92)",
    zIndex: 2,
    elevation: 2,
  },
  notifBadgeText: {
    color: stitchColors.onTertiary,
    fontSize: 10,
    fontWeight: "700",
  },
  hero: {
    backgroundColor: stitchColors.primary,
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  heroCollapsedBar: {
    backgroundColor: stitchColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  heroChevronRow: {
    alignItems: "center",
    marginTop: 2,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  heroChevronBtn: { margin: -6 },
  heroTagline: {
    color: stitchColors.onPrimary,
    textAlign: "center",
    opacity: 0.92,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  storyScroll: {
    gap: 14,
    paddingHorizontal: 10,
    paddingBottom: 4,
    alignItems: "flex-start",
  },
  storyItem: { alignItems: "center", width: 72 },
  storyRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    marginBottom: 6,
  },
  storyRingPrimary: {
    borderWidth: 2,
    borderColor: stitchColors.primaryContainer,
  },
  storyRingSecondary: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  storyAddInner: {
    flex: 1,
    borderRadius: 33,
    backgroundColor: stitchColors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  storyAddIcon: { color: stitchColors.primary, fontWeight: "700" },
  storyEmojiInner: {
    flex: 1,
    borderRadius: 33,
    backgroundColor: stitchColors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  storyEmoji: { fontSize: 28 },
  storyLabel: {
    color: stitchColors.onPrimary,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 10,
    opacity: 0.9,
  },
  demoStrip: {
    backgroundColor: stitchColors.infoBannerBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: stitchColors.outlineVariant,
  },
  demoStripText: { color: stitchColors.infoBannerText },
  list: { padding: 12, paddingBottom: 24, gap: 14, paddingTop: 12 },
  card: {
    marginBottom: 4,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: stitchColors.surfaceContainerLow,
    ...editorialCardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  headerText: { flex: 1 },
  authorName: { fontWeight: "600" },
  meta: { opacity: 0.62, marginTop: 2 },
  cardContent: { paddingTop: 6 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: -8,
  },
  likeCount: { marginRight: 12, fontWeight: "500" },
  commentHint: { opacity: 0.58 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
