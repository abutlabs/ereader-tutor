// Session Complete (Hearth) — fires when today's learned count reaches the daily
// goal. A filled ring with the streak flame at its center, a warm message, and a
// "Keep reading" button. Tasteful, not noisy.

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ring from "./Ring";
import { colors, fonts, radius, spacing } from "../theme/theme";

interface Props {
  visible: boolean;
  goal: number;
  streak: number;
  onClose: () => void;
}

export default function SessionComplete({ visible, goal, streak, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Ring value={1} total={1} size={120} stroke={9} color={colors.gold}>
            <MaterialCommunityIcons name="fire" size={44} color={colors.accent} />
            {streak > 0 ? <Text style={styles.streakNum}>{streak}</Text> : null}
          </Ring>

          <Text style={styles.title}>Goal complete!</Text>
          <Text style={styles.body}>
            You learned {goal} sentences today
            {streak > 0 ? ` and kept your ${streak}-day streak alive.` : "."}
          </Text>

          <Pressable style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Keep reading</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing(8),
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    paddingVertical: spacing(8),
    paddingHorizontal: spacing(7),
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  streakNum: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing(0.5),
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.ink,
    marginTop: spacing(5),
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15.5,
    lineHeight: 23,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing(2),
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(10),
    marginTop: spacing(6),
  },
  btnText: { fontFamily: fonts.uiSemibold, fontSize: 15.5, color: "#fff" },
});
