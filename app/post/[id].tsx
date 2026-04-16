import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { PostImageCarousel } from "@/components/PostImageCarousel";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { formatMeetupWhen } from "@/lib/meetup-format";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
import type { CommentWithAuthor, MeetupWithMeta, PostWithMeta } from "@/types/demo";

function MeetupsForSpotSection({
  postLocation,
  canMatch,
  meetups,
  loading,
  onCreatePress,
  onOpenMeetup,
  onJoin,
  joiningMeetupId,
}: {
  postLocation: string;
  canMatch: boolean;
  meetups: MeetupWithMeta[] | undefined;
  loading: boolean;
  onCreatePress: () => void;
  onOpenMeetup: (id: string) => void;
  onJoin: (id: string) => void;
  joiningMeetupId: string | undefined;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = Math.min(300, Math.max(260, windowWidth * 0.78));
  const carouselGap = 12;
  const showSwipeHint = (meetups?.length ?? 0) > 1;

  return (
    <Card style={styles.meetupCard} mode="outlined">
      <Card.Content>
        <Text variant="titleSmall" style={styles.meetupSectionTitle}>
          Meetups at this spot
        </Text>
        <Text variant="bodySmall" style={styles.meetupHint}>
          {canMatch
            ? `Places and meetups are matched to “${postLocation}”.`
            : "Add a specific restaurant or area on posts to find meetups here — you can still plan one and set the place yourself."}
        </Text>
        {showSwipeHint && canMatch && !loading && (meetups?.length ?? 0) > 1 ? (
          <Text variant="labelSmall" style={styles.meetupSwipeHint}>
            Swipe sideways to see more
          </Text>
        ) : null}
        {canMatch && loading ? (
          <ActivityIndicator style={styles.meetupsLoading} />
        ) : null}
        {canMatch && !loading && meetups?.length ? (
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={meetups.length > 1}
            decelerationRate="fast"
            contentContainerStyle={styles.meetupCarousel}
            snapToInterval={slideWidth + carouselGap}
            snapToAlignment="start"
            disableIntervalMomentum
          >
            {meetups.map((m, index) => (
              <View
                key={m.id}
                style={[
                  styles.meetupSlide,
                  { width: slideWidth },
                  index < meetups.length - 1 ? { marginRight: carouselGap } : null,
                ]}
              >
                <Pressable
                  onPress={() => onOpenMeetup(m.id)}
                  style={({ pressed }) => [pressed && styles.meetupSlidePressed]}
                >
                  <Image
                    source={{ uri: m.cover_image_url }}
                    style={styles.meetupSlideImage}
                  />
                  <View style={styles.meetupSlideBody}>
                    <Text variant="titleSmall" numberOfLines={2} style={styles.meetupSlideTitle}>
                      {m.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.meetupRowMeta} numberOfLines={2}>
                      {m.location}
                    </Text>
                    <Text variant="labelSmall" style={styles.meetupRowWhen}>
                      {formatMeetupWhen(m.datetime)}
                    </Text>
                    <Chip compact style={styles.meetupChip} textStyle={styles.meetupChipText}>
                      {m.participantCount}/{m.max_participants} going
                    </Chip>
                  </View>
                </Pressable>
                {m.joinedByMe ? (
                  <Button
                    mode="contained-tonal"
                    onPress={() => onOpenMeetup(m.id)}
                    style={styles.meetupSlideBtn}
                  >
                    View
                  </Button>
                ) : (
                  <Button
                    mode="outlined"
                    disabled={m.isFull || joiningMeetupId === m.id}
                    loading={joiningMeetupId === m.id}
                    onPress={() => onJoin(m.id)}
                    style={styles.meetupSlideBtn}
                    textColor={m.isFull ? undefined : stitchColors.primary}
                    labelStyle={styles.meetupJoinBtnLabel}
                  >
                    {m.isFull ? "Full" : "Join"}
                  </Button>
                )}
              </View>
            ))}
          </ScrollView>
        ) : null}
        {canMatch && !loading && meetups?.length === 0 ? (
          <Text variant="bodyMedium" style={styles.meetupEmpty}>
            No meetups scheduled for this area yet. Start one for people who want to go together.
          </Text>
        ) : null}
        <Button
          mode="contained"
          onPress={onCreatePress}
          icon="calendar-plus"
          style={styles.meetupCta}
          buttonColor={stitchColors.primary}
          textColor={stitchColors.onPrimary}
        >
          Plan a meetup here
        </Button>
      </Card.Content>
    </Card>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = typeof id === "string" ? id : id?.[0] ?? "";
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showMeetupsSection, setShowMeetupsSection] = useState(false);

  const postQuery = useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => demoApi.fetchPost(postId),
    enabled: !!postId,
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.postComments(postId),
    queryFn: () => demoApi.fetchPostComments(postId),
    enabled: !!postId,
  });

  const locationForMeetups = postQuery.data?.location?.trim() ?? "";
  const canMatchMeetups =
    !!locationForMeetups &&
    locationForMeetups.toLowerCase() !== "unknown";

  const meetupsAtSpotQuery = useQuery({
    queryKey: queryKeys.meetupsForLocation(locationForMeetups),
    queryFn: () => demoApi.fetchMeetupsForLocation(locationForMeetups),
    enabled: !!postId && canMatchMeetups && showMeetupsSection,
  });

  const likeMutation = useMutation({
    mutationFn: () => demoApi.toggleLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.post(postId) });
      const previous = queryClient.getQueryData(queryKeys.post(postId));
      queryClient.setQueryData(queryKeys.post(postId), (old: PostWithMeta | null | undefined) => {
        if (!old) return old;
        const nextLiked = !old.likedByMe;
        return {
          ...old,
          likedByMe: nextLiked,
          likeCount: old.likeCount + (nextLiked ? 1 : -1),
        };
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.post(postId), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => demoApi.addComment(postId, commentText),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: queryKeys.postComments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => demoApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.postComments(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => demoApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      router.back();
    },
  });

  const joinMeetupMutation = useMutation({
    mutationFn: (meetupId: string) => demoApi.joinMeetup(meetupId),
    onSuccess: (_d, meetupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetup(meetupId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetupsForLocation(locationForMeetups),
      });
    },
  });

  const currentUserId = demoApi.getCurrentUserId();

  if (postQuery.isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (postQuery.data == null) {
    return (
      <View style={styles.centered}>
        <Text>Post not found.</Text>
      </View>
    );
  }

  const post = postQuery.data;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Avatar.Image size={48} source={{ uri: post.author?.avatar_url }} />
        <View style={styles.headerText}>
          <Text variant="titleMedium" style={styles.authorName}>
            {post.author?.username}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {post.location}
          </Text>
        </View>
      </View>
      <PostImageCarousel uris={post.image_urls} horizontalInset={0} />
      <View style={styles.body}>
        <View style={styles.actions}>
          <IconButton
            icon={post.likedByMe ? "heart" : "heart-outline"}
            iconColor={post.likedByMe ? stitchColors.tertiary : undefined}
            size={28}
            onPress={() => likeMutation.mutate()}
          />
          <Text variant="bodyLarge">{post.likeCount} likes</Text>
        </View>
        <Text variant="bodyLarge" style={styles.caption}>
          {post.caption}
        </Text>
        {post.user_id === currentUserId ? (
          <Button
            mode="text"
            textColor={stitchColors.tertiary}
            onPress={() => deletePostMutation.mutate()}
            loading={deletePostMutation.isPending}
          >
            Delete post
          </Button>
        ) : null}
        {!showMeetupsSection ? (
          <Card style={styles.meetupGateCard} mode="outlined">
            <Card.Content style={styles.meetupGateContent}>
              <Text variant="bodyMedium" style={styles.meetupGateText}>
                See meetups planned near this place, or start one for others who want to go
                together.
              </Text>
              <Button
                mode="contained-tonal"
                icon="account-group-outline"
                onPress={() => setShowMeetupsSection(true)}
                style={styles.meetupGateBtn}
              >
                See meetups at this spot
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <MeetupsForSpotSection
            postLocation={post.location}
            canMatch={canMatchMeetups}
            meetups={meetupsAtSpotQuery.data}
            loading={meetupsAtSpotQuery.isPending}
            onCreatePress={() =>
              router.push({
                pathname: "/meetup/create",
                params: {
                  location: post.location.trim(),
                },
              })
            }
            onOpenMeetup={(id) => router.push(`/meetup/${id}`)}
            onJoin={(id) => joinMeetupMutation.mutate(id)}
            joiningMeetupId={
              joinMeetupMutation.isPending
                ? joinMeetupMutation.variables
                : undefined
            }
          />
        )}
        <Divider style={styles.divider} />
        <Text variant="titleSmall" style={styles.commentsTitle}>
          Comments
        </Text>
        {commentsQuery.isPending ? (
          <ActivityIndicator style={styles.commentsLoading} />
        ) : (
          (commentsQuery.data ?? []).map((c: CommentWithAuthor) => (
            <View key={c.id} style={styles.commentRow}>
              <View style={styles.commentMain}>
                <Text variant="labelLarge">{c.author?.username}</Text>
                <Text variant="bodyMedium">{c.content}</Text>
              </View>
              {c.user_id === currentUserId ? (
                <Button compact onPress={() => deleteCommentMutation.mutate(c.id)}>
                  Remove
                </Button>
              ) : null}
            </View>
          ))
        )}
        <TextInput
          mode="outlined"
          label="Add a comment"
          value={commentText}
          onChangeText={setCommentText}
          style={styles.input}
          right={
            <TextInput.Icon
              icon="send"
              disabled={!commentText.trim() || commentMutation.isPending}
              onPress={() => commentMutation.mutate()}
            />
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stitchColors.background },
  scrollContent: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
    backgroundColor: stitchColors.surfaceContainerLowest,
  },
  headerText: { flex: 1 },
  authorName: { fontWeight: "600" },
  meta: { opacity: 0.62, marginTop: 2 },
  body: { padding: 16, backgroundColor: stitchColors.surfaceContainerLowest, marginTop: 0 },
  actions: { flexDirection: "row", alignItems: "center", marginLeft: -8 },
  caption: { marginTop: 4 },
  meetupGateCard: {
    marginTop: 12,
    backgroundColor: stitchColors.surfaceContainerLow,
    borderColor: stitchColors.outlineVariant,
  },
  meetupGateContent: { paddingVertical: 4 },
  meetupGateText: { opacity: 0.88, lineHeight: 22, marginBottom: 12 },
  meetupGateBtn: { alignSelf: "stretch" },
  meetupCard: {
    marginTop: 12,
    backgroundColor: stitchColors.surfaceContainerLow,
    borderColor: stitchColors.outlineVariant,
  },
  meetupSectionTitle: { fontWeight: "700", marginBottom: 6 },
  meetupHint: { opacity: 0.75, marginBottom: 12, lineHeight: 20 },
  meetupsLoading: { marginVertical: 12 },
  meetupSwipeHint: {
    opacity: 0.65,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  meetupCarousel: {
    marginBottom: 4,
    paddingVertical: 4,
  },
  meetupSlide: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: stitchColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: stitchColors.outlineVariant,
  },
  meetupSlidePressed: { opacity: 0.94 },
  meetupSlideImage: {
    width: "100%",
    height: 120,
    backgroundColor: stitchColors.surfaceContainerHighest,
  },
  meetupSlideBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  meetupSlideTitle: { fontWeight: "600" },
  meetupSlideBtn: { marginHorizontal: 12, marginBottom: 12 },
  meetupJoinBtnLabel: { fontWeight: "600" },
  meetupRowMeta: { opacity: 0.78, marginTop: 4 },
  meetupRowWhen: { opacity: 0.8, marginTop: 4 },
  meetupChip: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: stitchColors.secondaryContainer,
  },
  meetupChipText: {
    fontSize: 11,
    color: stitchColors.onSecondaryContainer,
    fontWeight: "600",
  },
  meetupEmpty: { opacity: 0.85, marginBottom: 8, lineHeight: 22 },
  meetupCta: { marginTop: 4 },
  divider: { marginVertical: 16 },
  commentsTitle: { marginBottom: 8 },
  commentsLoading: { marginVertical: 16 },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  commentMain: { flex: 1, paddingRight: 8 },
  input: { marginTop: 8 },
});
