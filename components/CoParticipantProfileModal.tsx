import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Chip,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { stitchColors } from "@/lib/theme";
import * as demoApi from "@/lib/demo-api";
import { queryKeys } from "@/lib/query-client";

type Props = {
  visible: boolean;
  meetupId: string;
  userId: string;
  onDismiss: () => void;
};

export function CoParticipantProfileModal({
  visible,
  meetupId,
  userId,
  onDismiss,
}: Props) {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.coParticipantProfile(meetupId, userId),
    queryFn: () => demoApi.fetchCoParticipantProfile(meetupId, userId),
    enabled: visible && !!meetupId && !!userId,
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalWrap}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
        >
          {isPending ? (
            <ActivityIndicator size="large" style={styles.spinner} />
          ) : isError || data == null ? (
            <Text variant="bodyMedium" style={styles.muted}>
              Could not load this profile. Co-participant details are only available
              when you are both going to this meetup.
            </Text>
          ) : (
            <>
              <View style={styles.header}>
                <Avatar.Image size={88} source={{ uri: data.avatar_url }} />
                <Text variant="headlineSmall" style={styles.username}>
                  @{data.username}
                </Text>
                <Text variant="bodyMedium" style={styles.bio}>
                  {data.bio}
                </Text>
              </View>
              <TraitBlock label="Food preferences" items={data.food_preferences} />
              <TraitBlock label="Hobbies" items={data.hobbies} />
              <TraitBlock label="Skills & extras" items={data.extracurricular_skills} />
            </>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

function TraitBlock({ label, items }: { label: string; items: string[] }) {
  if (!items.length) {
    return (
      <View style={styles.block}>
        <Text variant="labelLarge" style={styles.blockLabel}>
          {label}
        </Text>
        <Text variant="bodySmall" style={styles.emptyTraits}>
          Not filled in yet
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.block}>
      <Text variant="labelLarge" style={styles.blockLabel}>
        {label}
      </Text>
      <View style={styles.chips}>
        {items.map((t, i) => (
          <Chip key={`${label}-${i}-${t}`} compact style={styles.chip} textStyle={styles.chipText}>
            {t}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalWrap: {
    backgroundColor: stitchColors.surfaceContainerLowest,
    marginHorizontal: 20,
    marginVertical: 48,
    borderRadius: 20,
    maxHeight: "88%",
    overflow: "hidden",
  },
  scroll: { maxHeight: "100%" },
  scrollInner: { padding: 20, paddingBottom: 28 },
  spinner: { paddingVertical: 24 },
  muted: { opacity: 0.85, lineHeight: 22 },
  header: { alignItems: "center", marginBottom: 8 },
  username: { marginTop: 12, fontWeight: "700" },
  bio: { marginTop: 8, textAlign: "center", opacity: 0.88, lineHeight: 22 },
  block: { marginTop: 18 },
  blockLabel: {
    color: stitchColors.primaryDim,
    fontWeight: "700",
    marginBottom: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: stitchColors.secondaryContainer,
  },
  chipText: { color: stitchColors.onSecondaryContainer, fontSize: 12 },
  emptyTraits: { opacity: 0.55, fontStyle: "italic" },
});
