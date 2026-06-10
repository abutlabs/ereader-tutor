// Import a book from a .zip package (Hearth). Pick → preview the manifest →
// resolve a conflict if the book already exists → install into the library.

import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import {
  installPackage,
  previewPackage,
  type InstallMode,
  type PackagePreview,
} from "../src/transfer/package";
import { colors, fonts, radius, spacing } from "../src/theme/theme";

export default function ImportScreen() {
  const router = useRouter();
  const [uri, setUri] = useState<string | null>(null);
  const [preview, setPreview] = useState<PackagePreview | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/zip", "application/octet-stream", "*/*"],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setBusy(true);
    try {
      const p = await previewPackage(a.uri);
      setUri(a.uri);
      setPreview(p);
    } catch (e) {
      Alert.alert("Couldn't read that file", e instanceof Error ? e.message : "Not a Hearth package.");
    } finally {
      setBusy(false);
    }
  }

  async function install(mode: InstallMode) {
    if (!uri || busy) return;
    setBusy(true);
    try {
      const book = await installPackage(uri, mode);
      setBusy(false);
      router.replace(`/book/${book.id}`);
    } catch (e) {
      setBusy(false);
      Alert.alert("Import failed", e instanceof Error ? e.message : "Couldn't install the package.");
    }
  }

  const m = preview?.manifest;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Import a book</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        {!preview ? (
          <>
            <Pressable style={styles.pickBtn} onPress={pick} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <Feather name="download" size={20} color={colors.accent} />
                  <Text style={styles.pickText}>Browse for a .zip</Text>
                </>
              )}
            </Pressable>
            <Text style={styles.hint}>
              Open a Hearth book package shared from another device — its lessons, page
              photos, progress, and word list all come across.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.bookTitle}>{m?.book.title}</Text>
              <Text style={styles.bookMeta}>
                {m?.book.author} · {m?.book.language} · {m?.pageCount} pages
              </Text>
              <View style={styles.badges}>
                <Badge on={m?.flags.photos} label="Page photos" />
                <Badge on={m?.flags.progress} label="Progress" />
                <Badge on={m?.flags.wordlist} label="Word list" />
              </View>
              <Text style={[styles.valid, !preview.valid && { color: colors.accentDeep }]}>
                {preview.valid
                  ? `Valid package · format v${m?.formatVersion}`
                  : "⚠ Checksum mismatch — the file may be corrupted."}
              </Text>
            </View>

            {preview.exists ? (
              <>
                <Text style={styles.conflictNote}>
                  A book with this id is already in your library. How should it import?
                </Text>
                <Choice
                  icon="layers"
                  title="Merge"
                  sub="Add new pages, keep your progress."
                  onPress={() => install("merge")}
                />
                <Choice
                  icon="copy"
                  title="Keep both"
                  sub="Import as a separate copy."
                  onPress={() => install("copy")}
                />
                <Choice
                  icon="alert-triangle"
                  title="Replace"
                  sub="Overwrite — your progress is lost."
                  destructive
                  onPress={() => install("replace")}
                />
              </>
            ) : (
              <Pressable style={styles.importBtn} onPress={() => install("new")} disabled={busy}>
                <Text style={styles.importText}>{busy ? "Unpacking…" : "Import to library"}</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ on, label }: { on?: boolean; label: string }) {
  return (
    <View style={styles.badge}>
      <Feather name={on ? "check" : "x"} size={13} color={on ? colors.good : colors.inkFaint} />
      <Text style={[styles.badgeText, on && { color: colors.ink }]}>{label}</Text>
    </View>
  );
}

function Choice({
  icon,
  title,
  sub,
  destructive,
  onPress,
}: {
  icon: any;
  title: string;
  sub: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.choice, destructive && { borderColor: colors.accent }]} onPress={onPress}>
      <Feather name={icon} size={20} color={destructive ? colors.accent : colors.inkSoft} />
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSub}>{sub}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.rule} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    backgroundColor: colors.paperWarm,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(5),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.accent,
  },
  pickText: { fontFamily: fonts.uiSemibold, fontSize: 16, color: colors.accent },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing(4),
  },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing(4.5), marginBottom: spacing(5) },
  bookTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.ink },
  bookMeta: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft, marginTop: spacing(1) },
  badges: { flexDirection: "row", gap: spacing(3), marginTop: spacing(3) },
  badge: { flexDirection: "row", alignItems: "center", gap: spacing(1) },
  badgeText: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.inkFaint },
  valid: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.good, marginTop: spacing(3) },
  conflictNote: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, marginBottom: spacing(3) },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.ruleSoft,
    padding: spacing(4),
    marginBottom: spacing(3),
  },
  choiceTitle: { fontFamily: fonts.ui, fontSize: 16, color: colors.ink },
  choiceSub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: spacing(0.5) },
  importBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing(4), alignItems: "center" },
  importText: { fontFamily: fonts.uiSemibold, fontSize: 15.5, color: "#fff" },
});
