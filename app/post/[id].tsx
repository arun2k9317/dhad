import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { PostImageCarousel } from "@/components/PostImageCarousel";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Divider,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
import type { CommentWithAuthor, PostWithMeta } from "@/types/demo";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = typeof id === "string" ? id : id?.[0] ?? "";
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

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
