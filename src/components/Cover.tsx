// Book cover / spine (Hearth) — a warm gradient rectangle with a light spine
// line, centered serif title, and an optional "complete" check badge.

import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors, coverGradient, fonts, hueFromString } from "../theme/theme";

interface Props {
  title: string;
  seed?: string; // string the hue is derived from (defaults to title)
  w?: number;
  h?: number;
  radius?: number;
  complete?: boolean;
  fontSize?: number;
}

export default function Cover({ title, seed, w = 56, h, radius = 7, complete, fontSize = 14 }: Props) {
  const height = h || Math.round(w * 1.36);
  const [from, to] = coverGradient(hueFromString(seed || title));
  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.cover, { width: w, height, borderRadius: radius }]}
    >
      <View style={[styles.spine, { left: w * 0.12 }]} />
      <View style={styles.titleWrap}>
        <Text style={[styles.title, { fontSize }]} numberOfLines={4}>
          {title}
        </Text>
      </View>
      {complete && (
        <View style={styles.badge}>
          <Feather name="check" size={11} color="#fff" />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: "hidden", justifyContent: "center" },
  spine: { position: "absolute", top: 0, bottom: 0, width: 1.5, backgroundColor: "rgba(255,255,255,0.22)" },
  titleWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 7 },
  title: {
    fontFamily: fonts.display,
    color: "#fff",
    textAlign: "center",
    lineHeight: undefined,
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: colors.good,
    alignItems: "center",
    justifyContent: "center",
  },
});
