import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";

export default function CreateMeetupScreen() {
  const queryClient = useQueryClient();
  const defaultWhen = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("8");

  const createMutation = useMutation({
    mutationFn: () =>
      demoApi.createMeetup({
        title,
        description,
        location,
        datetime: defaultWhen,
        max_participants: Math.max(2, parseInt(maxParticipants, 10) || 8),
      }),
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetups });
      router.replace(`/meetup/${newId}`);
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            New meetup (demo)
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Date/time is fixed to five days from first open (18:00 local) for this mock. Wire a picker when you add a backend.
          </Text>
          <TextInput
            label="Title"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            label="Description"
            mode="outlined"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.input}
          />
          <TextInput
            label="Location"
            mode="outlined"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
          <TextInput
            label="Max participants"
            mode="outlined"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Button
            mode="contained"
            disabled={!title.trim() || !location.trim() || createMutation.isPending}
            loading={createMutation.isPending}
            onPress={() => createMutation.mutate()}
            style={styles.btn}
          >
            Create
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: stitchColors.background,
    flexGrow: 1,
  },
  card: { marginTop: 8, borderRadius: 20 },
  title: { marginBottom: 8, fontWeight: "600" },
  hint: { opacity: 0.65, marginBottom: 16 },
  input: { marginBottom: 12 },
  btn: { marginTop: 8 },
});
