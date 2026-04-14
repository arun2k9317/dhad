import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
import type { MeetupMessageWithAuthor } from "@/types/demo";

export default function MeetupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetupId = typeof id === "string" ? id : id?.[0] ?? "";
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<MeetupMessageWithAuthor>>(null);
  const [draft, setDraft] = useState("");

  const meetupQuery = useQuery({
    queryKey: queryKeys.meetup(meetupId),
    queryFn: () => demoApi.fetchMeetup(meetupId),
    enabled: !!meetupId,
  });

  useFocusEffect(
    useCallback(() => {
      if (!meetupId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.meetup(meetupId) });
    }, [meetupId, queryClient])
  );

  const messagesQuery = useQuery({
    queryKey: queryKeys.meetupMessages(meetupId),
    queryFn: () => demoApi.fetchMeetupMessages(meetupId),
    enabled: !!meetupId && meetupQuery.data?.joinedByMe === true,
  });

  const joinMutation = useMutation({
    mutationFn: () => demoApi.joinMeetup(meetupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetup(meetupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetupParticipants(meetupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetupMessages(meetupId) });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => demoApi.sendMeetupMessage(meetupId, text),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: queryKeys.meetupMessages(meetupId) });
    },
  });

  const uid = demoApi.getCurrentUserId();

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: MeetupMessageWithAuthor }) => {
      const mine = item.user_id === uid;
      return (
        <View
          style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}
        >
          {!mine ? (
            <Avatar.Image size={36} source={{ uri: item.author?.avatar_url }} style={styles.avatar} />
          ) : null}
          <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            {!mine ? (
              <Text variant="labelSmall" style={styles.bubbleAuthor}>
                {item.author?.username ?? "Unknown"}
              </Text>
            ) : null}
            <Text variant="bodyMedium" style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
              {item.content}
            </Text>
            <Text variant="labelSmall" style={styles.bubbleTime}>
              {formatChatTime(item.created_at)}
            </Text>
          </View>
        </View>
      );
    },
    [uid]
  );

  if (!meetupId || meetupQuery.isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (meetupQuery.data == null) {
    return (
      <View style={styles.centered}>
        <Text>Meetup not found.</Text>
      </View>
    );
  }

  const m = meetupQuery.data;

  if (!m.joinedByMe) {
    return (
      <View style={[styles.gate, { paddingBottom: insets.bottom + 24 }]}>
        <Text variant="titleMedium" style={styles.gateTitle}>
          Join to chat
        </Text>
        <Text variant="bodyMedium" style={styles.gateBody}>
          Only people going to this meetup can use group chat to plan the visit.
        </Text>
        <Button
          mode="contained"
          disabled={m.isFull}
          loading={joinMutation.isPending}
          onPress={() => joinMutation.mutate()}
          style={styles.gateBtn}
        >
          {m.isFull ? "Meetup is full" : "Join meetup"}
        </Button>
        <Button mode="text" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const messages = messagesQuery.data ?? [];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 12 + insets.bottom },
        ]}
        onContentSizeChange={scrollToEnd}
        ListEmptyComponent={
          messagesQuery.isPending ? (
            <ActivityIndicator style={styles.listSpinner} />
          ) : (
            <Text variant="bodyMedium" style={styles.empty}>
              No messages yet. Say hi and coordinate details.
            </Text>
          )
        }
      />
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TextInput
          mode="outlined"
          placeholder="Message the group…"
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
          multiline
          maxLength={2000}
          dense
          disabled={sendMutation.isPending}
        />
        <Button
          mode="contained"
          disabled={!draft.trim() || sendMutation.isPending}
          loading={sendMutation.isPending}
          onPress={() => sendMutation.mutate(draft)}
          style={styles.sendBtn}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatChatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: stitchColors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  gate: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: stitchColors.background,
  },
  gateTitle: { marginBottom: 8 },
  gateBody: { opacity: 0.8, marginBottom: 20 },
  gateBtn: { marginBottom: 8 },
  listContent: { padding: 16, paddingTop: 8, flexGrow: 1 },
  listSpinner: { marginTop: 24 },
  empty: { opacity: 0.7, marginTop: 24, textAlign: "center" },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 10,
    maxWidth: "100%",
  },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubbleRowTheirs: { justifyContent: "flex-start" },
  avatar: { marginRight: 8, marginTop: 4 },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: stitchColors.primaryContainer,
  },
  bubbleTheirs: {
    backgroundColor: stitchColors.surfaceContainerHigh,
  },
  bubbleAuthor: { opacity: 0.85, marginBottom: 4 },
  bubbleTextMine: { color: stitchColors.onPrimaryContainer },
  bubbleTextTheirs: { color: stitchColors.onSurface },
  bubbleTime: { opacity: 0.55, marginTop: 6 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: stitchColors.outlineVariant,
    backgroundColor: stitchColors.surfaceContainerLowest,
  },
  input: { flex: 1, maxHeight: 120, backgroundColor: stitchColors.surfaceContainerLowest },
  sendBtn: { marginBottom: 4 },
});
