// A small modal that asks for a single number — used for labelling a scan with
// its book page number, and for re-labelling a page.

import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, spacing } from "../theme/theme";

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  initial?: number;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: number) => void;
}

export default function NumberPrompt({
  visible,
  title,
  message,
  initial,
  confirmLabel = "OK",
  onCancel,
  onConfirm,
}: Props) {
  const [text, setText] = useState("");

  // Reset to the suggested value each time the prompt opens.
  useEffect(() => {
    if (visible) setText(initial != null ? String(initial) : "");
  }, [visible, initial]);

  const n = parseInt(text, 10);
  const valid = Number.isFinite(n) && n > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            autoFocus
            selectTextOnFocus
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.rule}
          />
          <View style={styles.row}>
            <Pressable style={styles.ghostBtn} onPress={onCancel}>
              <Text style={styles.ghostText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.solidBtn, !valid && { opacity: 0.4 }]}
              disabled={!valid}
              onPress={() => valid && onConfirm(n)}
            >
              <Text style={styles.solidText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing(8),
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing(6),
    width: "100%",
    maxWidth: 340,
  },
  title: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: spacing(2),
  },
  input: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.ink,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: spacing(2),
    marginTop: spacing(4),
  },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: spacing(3), marginTop: spacing(5) },
  ghostBtn: {
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(5),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  ghostText: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
  solidBtn: {
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(6),
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  solidText: { fontFamily: fonts.ui, fontSize: 15, color: colors.paper },
});
