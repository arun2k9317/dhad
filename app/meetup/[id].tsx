import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Divider,
  List,
  Text,
} from "react-native-paper";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";
import type { Profile } from "@/types/demo";

export default function MeetupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetupId = typeof id === "string" ? id : id?.[0] ?? "";
  const queryClient = useQueryClient();

  const meetupQuery = useQuery({
    queryKey: queryKeys.meetup(meetupId),
    queryFn: () => demoApi.fetchMeetup(meetupId),
    enabled: !!meetupId,
  });

  const participantsQuery = useQuery({
    queryKey: queryKeys.meetupParticipants(meetupId),
    queryFn: () => demoApi.fetchMeetupParticipants(meetupId),
    enabled: !!meetupId,
  });

  const joinMutation = useMutation({
    mutationFn: () => demoApi.joinMeetup(meetupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetup(meetupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetupParticipants(meetupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => demoApi.leaveMeetup(meetupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetup(meetupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetupParticipants(meetupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
    },
  });

  if (meetupQuery.isPending) {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: m.cover_image_url }}
          style={styles.hero}
          resizeMode="cover"
        />
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">{m.title}</Text>
          <Text variant="bodyMedium" style={styles.loc}>
            {m.location}
          </Text>
          <Text variant="bodyLarge" style={styles.when}>
            {formatWhen(m.datetime)}
          </Text>
          <Text variant="bodyMedium" style={styles.desc}>
            {m.description}
          </Text>
          <Text variant="labelLarge" style={styles.capacity}>
            {m.participantCount} / {m.max_participants} spots filled
          </Text>
          <View style={styles.actions}>
            {m.joinedByMe ? (
              <Button
                mode="contained-tonal"
                onPress={() => leaveMutation.mutate()}
                loading={leaveMutation.isPending}
              >
                Leave meetup
              </Button>
            ) : (
              <Button
                mode="contained"
                disabled={m.isFull}
                onPress={() => joinMutation.mutate()}
                loading={joinMutation.isPending}
              >
                {m.isFull ? "Full" : "Join meetup"}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Host
      </Text>
      <List.Item
        title={m.creator?.username ?? "Unknown"}
        description={`Reputation ${m.creator?.reputation_score ?? "—"}`}
        left={() => (
          <Avatar.Image size={48} source={{ uri: m.creator?.avatar_url }} />
        )}
      />

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Going
      </Text>
      {participantsQuery.isPending ? (
        <ActivityIndicator style={styles.pad} />
      ) : (
        (participantsQuery.data ?? []).map((p: Profile) => (
          <List.Item
            key={p.id}
            title={`@${p.username}`}
            left={() => <Avatar.Image size={40} source={{ uri: p.avatar_url }} />}
          />
        ))
      )}
    </ScrollView>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: stitchColors.background,
  },
  heroWrap: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    height: 220,
    backgroundColor: stitchColors.surfaceContainerHighest,
  },
  hero: { width: "100%", height: "100%" },
  card: { marginBottom: 16, borderRadius: 20 },
  loc: { opacity: 0.75, marginTop: 4 },
  when: { marginTop: 12 },
  desc: { marginTop: 12 },
  capacity: { marginTop: 16 },
  actions: { marginTop: 16 },
  sectionTitle: { marginTop: 8, marginBottom: 4 },
  divider: { marginVertical: 16 },
  pad: { marginVertical: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
