import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";

export default function CreatePostScreen() {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [pickedUris, setPickedUris] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: () =>
      demoApi.createPost({
        caption,
        location: location || "Unknown",
        imageUrls: pickedUris,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });
      setCaption("");
      setLocation("");
      setPickedUris([]);
      router.push("/(tabs)");
    },
  });

  async function pickImages() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 8,
      quality: 0.85,
    });
    if (!res.canceled && res.assets?.length) {
      setPickedUris(res.assets.map((a) => a.uri));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            New post (demo)
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Pick one or more photos (multi-select). If you skip photos, a stock image is used. Local URIs are demo-only.
          </Text>
          <TextInput
            label="Caption"
            mode="outlined"
            value={caption}
            onChangeText={setCaption}
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
          <Button mode="outlined" onPress={pickImages} style={styles.btn}>
            {pickedUris.length
              ? `${pickedUris.length} photo${pickedUris.length === 1 ? "" : "s"} · tap to change`
              : "Pick photos (optional)"}
          </Button>
          <Button
            mode="contained"
            disabled={!caption.trim() || createMutation.isPending}
            loading={createMutation.isPending}
            onPress={() => createMutation.mutate()}
            style={styles.btn}
          >
            Post
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
