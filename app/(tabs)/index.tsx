import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
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
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
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
  const navigation = useNavigation();

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <RNText
          style={{
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontSize: 26,
            color: stitchColors.onPrimary,
            letterSpacing: -0.8,
          }}
        >
          DHAD
        </RNText>
      ),
      headerLeft: () =>
        profile?.avatar_url ? (
          <Avatar.Image
            size={40}
            source={{ uri: profile.avatar_url }}
            style={styles.headerAvatar}
          />
        ) : null,
      headerRight: () => (
        <IconButton
          icon="bell-outline"
          iconColor={stitchColors.onPrimary}
          onPress={() => {}}
          style={{ marginRight: 4 }}
        />
      ),
      headerTitleAlign: "left",
    });
  }, [navigation, profile?.avatar_url]);

  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.posts,
    queryFn: demoApi.fetchFeedPosts,
  });

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
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
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
  headerAvatar: {
    marginLeft: 8,
    borderWidth: 2,
    borderColor: stitchColors.surfaceContainerLowest,
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
