// Streak flame chip (Hearth). `soft` drops the pill background (for headers).

import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, radius, spacing } from "../theme/theme";

export default function Flame({ n, soft }: { n: number; soft?: boolean }) {
  return (
    <View style={[styles.chip, soft && styles.soft]}>
      <MaterialCommunityIcons name="fire" size={16} color={colors.accent} />
      <Text style={styles.count}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: spacing(1.25),
    paddingHorizontal: spacing(2.5),
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  soft: { backgroundColor: "transparent", paddingVertical: 0, paddingHorizontal: 0 },
  count: { fontFamily: fonts.uiBold, fontSize: 13.5, color: colors.ink },
});
