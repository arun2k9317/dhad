import { StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { editorialCardShadow, stitchColors } from "@/lib/theme";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  pending?: boolean;
};

export function LeaveMeetupDialog({
  visible,
  onDismiss,
  onConfirm,
  pending = false,
}: Props) {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={pending ? undefined : onDismiss}
        dismissable={!pending}
        style={styles.dialog}
      >
        <View style={styles.iconWrap}>
          <Dialog.Icon icon="exit-to-app" size={40} color={stitchColors.tertiary} />
        </View>
        <Dialog.Title style={styles.title}>Leave this meetup?</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text variant="bodyMedium" style={styles.body}>
            {`You can join again if there is space. Group chat and co-participant profiles are only available while you're going.`}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            disabled={pending}
            style={styles.cancelBtn}
            textColor={stitchColors.primary}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            loading={pending}
            disabled={pending}
            buttonColor={stitchColors.tertiary}
            textColor={stitchColors.onTertiary}
            style={styles.leaveBtn}
          >
            Leave
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: stitchColors.surfaceContainerLowest,
    borderRadius: 24,
    marginHorizontal: 20,
    ...editorialCardShadow,
  },
  iconWrap: {
    alignItems: "center",
    paddingTop: 8,
  },
  title: {
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: -0.3,
    color: stitchColors.onSurface,
  },
  content: {
    paddingTop: 4,
  },
  body: {
    color: stitchColors.onSurfaceVariant,
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  cancelBtn: {
    borderColor: stitchColors.outline,
    borderRadius: 999,
  },
  leaveBtn: {
    borderRadius: 999,
  },
});
