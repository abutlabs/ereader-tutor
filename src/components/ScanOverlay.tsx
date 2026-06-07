// Full-screen overlay for the capture pipeline: a spinner while Claude reads the
// page, a retryable error state, and a success state that offers to open the page.

import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing } from "../theme/theme";

export type ScanPhase =
  | { k: "working"; label: string }
  | { k: "error"; message: string }
  | { k: "queued"; page: number }
  | { k: "done"; pageIdx: number };

interface Props {
  phase: ScanPhase | null;
  onRetry: () => void;
  onCancel: () => void;
  onRead: (pageIdx: number) => void;
  onScanAnother: () => void;
}

export default function ScanOverlay({
  phase,
  onRetry,
  onCancel,
  onRead,
  onScanAnother,
}: Props) {
  return (
    <Modal visible={!!phase} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {phase?.k === "working" && (
            <>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.label}>{phase.label}</Text>
              <Text style={styles.hint}>This takes a few seconds.</Text>
            </>
          )}

          {phase?.k === "queued" && (
            <>
              <Feather name="upload-cloud" size={36} color={colors.good} />
              <Text style={styles.label}>Page {phase.page} queued</Text>
              <Text style={styles.hint}>
                It&rsquo;s processing on the laptop. Pull it into your book with
                &ldquo;Sync from bridge&rdquo; when it&rsquo;s ready — you don&rsquo;t need to wait.
              </Text>
              <View style={styles.row}>
                <Pressable style={styles.ghostBtn} onPress={onScanAnother}>
                  <Text style={styles.ghostText}>Scan another</Text>
                </Pressable>
                <Pressable style={styles.solidBtn} onPress={onCancel}>
                  <Text style={styles.solidText}>Done</Text>
                </Pressable>
              </View>
            </>
          )}

          {phase?.k === "error" && (
            <>
              <Feather name="alert-circle" size={36} color={colors.accent} />
              <Text style={styles.label}>Couldn't process the page</Text>
              <Text style={styles.hint}>{phase.message}</Text>
              <View style={styles.row}>
                <Pressable style={styles.ghostBtn} onPress={onCancel}>
                  <Text style={styles.ghostText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.solidBtn} onPress={onRetry}>
                  <Text style={styles.solidText}>Try again</Text>
                </Pressable>
              </View>
            </>
          )}

          {phase?.k === "done" && (
            <>
              <Feather name="check-circle" size={36} color={colors.good} />
              <Text style={styles.label}>Page added to your book</Text>
              <View style={styles.row}>
                <Pressable style={styles.ghostBtn} onPress={onScanAnother}>
                  <Text style={styles.ghostText}>Scan another</Text>
                </Pressable>
                <Pressable
                  style={styles.solidBtn}
                  onPress={() => onRead(phase.pageIdx)}
                >
                  <Text style={styles.solidText}>Read it</Text>
                </Pressable>
              </View>
              <Pressable onPress={onCancel} hitSlop={8} style={{ marginTop: spacing(3) }}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </>
          )}
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
    padding: spacing(7),
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing(4),
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing(2),
  },
  row: {
    flexDirection: "row",
    gap: spacing(3),
    marginTop: spacing(5),
  },
  ghostBtn: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(5),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  ghostText: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
  solidBtn: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(6),
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  solidText: { fontFamily: fonts.ui, fontSize: 15, color: colors.paper },
  doneText: { fontFamily: fonts.ui, fontSize: 14, color: colors.inkSoft },
});
