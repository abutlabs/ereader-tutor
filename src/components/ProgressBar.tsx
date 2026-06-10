// Thin progress bar (Hearth). `gradient` fills accent → gold.

import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/theme";

export default function ProgressBar({
  value,
  total,
  height = 6,
  gradient,
}: {
  value: number;
  total: number;
  height?: number;
  gradient?: boolean;
}) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      {gradient ? (
        <LinearGradient
          colors={[colors.accent, colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${pct * 100}%`, height: "100%", borderRadius: height }}
        />
      ) : (
        <View
          style={{ width: `${pct * 100}%`, height: "100%", borderRadius: height, backgroundColor: colors.accent }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.ruleSoft, overflow: "hidden" },
});
