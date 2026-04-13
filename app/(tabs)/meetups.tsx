import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Text,
} from "react-native-paper";
import { usePrimaryBrandStatusBar } from "@/hooks/usePrimaryBrandStatusBar";
import { editorialCardShadow, stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
import type { MeetupWithMeta } from "@/types/demo";

const MEETUP_HERO_EXPANDED_PH = 268;
const MEETUP_HERO_COLLAPSED_PH = 76;

function MeetupsHero({
  collapsed,
  onCollapseToggle,
  onHeroMeasured,
}: {
  collapsed: boolean;
  onCollapseToggle: () => void;
  onHeroMeasured?: (height: number) => void;
}) {
  const createButton = (
    <Button
      mode="contained"
      icon="calendar-plus"
      buttonColor={stitchColors.primaryContainer}
      textColor={stitchColors.onPrimaryContainer}
      onPress={() => router.push("/meetup/create")}
      style={[styles.heroCta, collapsed && styles.heroCtaCollapsed]}
      contentStyle={styles.heroCtaContent}
      compact={collapsed}
    >
      Create meetup
    </Button>
  );

  if (collapsed) {
    return (
      <View
        style={styles.heroShell}
        onLayout={(e) => onHeroMeasured?.(e.nativeEvent.layout.height)}
      >
        <View style={styles.heroCollapsedInner}>
          {createButton}
          <IconButton
            icon="chevron-down"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={onCollapseToggle}
            accessibilityLabel="Expand meetups header"
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
        <View style={styles.heroIconRing}>
          <MaterialCommunityIcons
            name="account-group"
            size={40}
            color={stitchColors.onPrimary}
          />
        </View>
        <Text variant="titleMedium" style={styles.heroTagline}>
          Share tables, taste together.
        </Text>
        {createButton}
        <View style={styles.heroChevronRow}>
          <IconButton
            icon="chevron-up"
            iconColor={stitchColors.onPrimary}
            size={26}
            onPress={onCollapseToggle}
            accessibilityLabel="Minimize meetups header"
            style={styles.heroChevronBtn}
          />
        </View>
      </View>
    </View>
  );
}

export default function MeetupsScreen() {
  usePrimaryBrandStatusBar();
  const [heroHeight, setHeroHeight] = useState(MEETUP_HERO_EXPANDED_PH);
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const handleHeroCollapseToggle = useCallback(() => {
    setHeroCollapsed((prev) => {
      const next = !prev;
      setHeroHeight(next ? MEETUP_HERO_COLLAPSED_PH : MEETUP_HERO_EXPANDED_PH);
      return next;
    });
  }, []);
  const { data, isPending, isError, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.meetups,
    queryFn: demoApi.fetchMeetups,
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => demoApi.joinMeetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (id: string) => demoApi.leaveMeetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: MeetupWithMeta }) => (
      <Card style={styles.card} mode="contained">
        <View style={styles.cardClip}>
          <Pressable
            onPress={() => router.push(`/meetup/${item.id}`)}
            style={({ pressed }) => [pressed && styles.pressedTap]}
          >
            <Image
              source={{ uri: item.cover_image_url }}
              style={styles.cover}
              resizeMode="cover"
            />
            <Card.Content style={styles.cardBody}>
              <Text variant="titleLarge" style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text variant="bodyMedium" style={styles.location} numberOfLines={1}>
                {item.location}
              </Text>
              <Text variant="bodyMedium" style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.when}>
                {formatMeetupWhen(item.datetime)}
              </Text>
            </Card.Content>
          </Pressable>
          <Card.Content style={styles.cardFooter}>
            <View style={styles.row}>
              <Chip
                compact
                style={styles.chip}
                textStyle={styles.chipText}
                mode="flat"
              >
                {item.participantCount}/{item.max_participants} joined
              </Chip>
              {item.joinedByMe ? (
                <Button
                  mode="outlined"
                  compact
                  textColor={stitchColors.primary}
                  style={styles.actionBtn}
                  onPress={() => leaveMutation.mutate(item.id)}
                  loading={leaveMutation.isPending}
                >
                  Leave
                </Button>
              ) : (
                <Button
                  mode="contained"
                  compact
                  buttonColor={stitchColors.primary}
                  textColor={stitchColors.onPrimary}
                  style={styles.actionBtn}
                  disabled={item.isFull}
                  onPress={() => joinMutation.mutate(item.id)}
                  loading={joinMutation.isPending}
                >
                  {item.isFull ? "Full" : "Join"}
                </Button>
              )}
            </View>
          </Card.Content>
        </View>
      </Card>
    ),
    [joinMutation, leaveMutation]
  );

  const listHeader = useMemo(
    () => <View style={{ height: heroHeight }} />,
    [heroHeight]
  );

  const floatingHero = (
    <View style={styles.heroFloatWrapper} pointerEvents="box-none">
      <MeetupsHero
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
            <Text variant="bodyLarge">Could not load meetups.</Text>
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

function formatMeetupWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stitchColors.background },
  heroFloatWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
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
  hero: {
    backgroundColor: stitchColors.primary,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  heroCollapsedInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: stitchColors.primary,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 4,
    gap: 4,
  },
  heroChevronRow: {
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 8,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  heroChevronBtn: { margin: -6 },
  heroIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTagline: {
    color: stitchColors.onPrimary,
    textAlign: "center",
    opacity: 0.95,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  heroCta: { borderRadius: 999, alignSelf: "stretch", maxWidth: 320 },
  heroCtaCollapsed: { flex: 1, minWidth: 0, maxWidth: undefined, alignSelf: "stretch" },
  heroCtaContent: { paddingVertical: 4 },
  list: { padding: 12, gap: 16, paddingBottom: 24, paddingTop: 12 },
  card: {
    marginBottom: 2,
    borderRadius: 16,
    backgroundColor: stitchColors.surfaceContainerLow,
    overflow: "hidden",
    ...editorialCardShadow,
  },
  cardClip: { borderRadius: 16, overflow: "hidden" },
  pressedTap: { opacity: 0.96 },
  cover: {
    width: "100%",
    height: 168,
    backgroundColor: stitchColors.surfaceContainerHighest,
  },
  cardBody: { paddingTop: 12, paddingBottom: 4 },
  cardFooter: { paddingTop: 0, paddingBottom: 14 },
  title: {
    color: stitchColors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  location: {
    color: stitchColors.onSurfaceVariant,
    marginBottom: 8,
    opacity: 0.95,
  },
  desc: {
    color: stitchColors.onSurface,
    opacity: 0.88,
    lineHeight: 22,
    marginBottom: 8,
  },
  when: {
    color: stitchColors.onSurfaceVariant,
    opacity: 0.85,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: stitchColors.secondaryContainer,
  },
  chipText: {
    color: stitchColors.onSecondaryContainer,
    fontWeight: "700",
    fontSize: 11,
  },
  actionBtn: { borderRadius: 999 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
