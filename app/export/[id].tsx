// Export a book as a portable .zip package (Hearth). Choose what to include,
// see the estimated size, then build + open the Android share sheet.

import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book } from "../../src/data/schema";
import { getBook } from "../../src/storage/books";
import Cover from "../../src/components/Cover";
import {
  buildPackage,
  estimateSize,
  formatBytes,
  sharePackage,
  type ExportFlags,
} from "../../src/transfer/package";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

const PRESETS: Record<string, ExportFlags> = {
  full: { photos: true, progress: true, wordlist: true },
  clean: { photos: true, progress: false, wordlist: true },
};

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [flags, setFlags] = useState<ExportFlags>(PRESETS.full);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => { if (id) getBook(id).then(setBook); }, [id]));

  const presetName =
    JSON.stringify(flags) === JSON.stringify(PRESETS.full)
      ? "full"
      : JSON.stringify(flags) === JSON.stringify(PRESETS.clean)
        ? "clean"
        : "custom";

  const pages = book?.pages.length ?? 0;
  const size = estimateSize(pages, flags);
  const fileName = `${(book?.meta.title || "Book").replace(/\s+/g, "_")}${flags.progress ? "" : "-clean"}.zip`;

  async function onExport() {
    if (!book || busy) return;
    setBusy(true);
    try {
      const pkg = await buildPackage(book.id, flags);
      await sharePackage(pkg.uri);
      setBusy(false);
      router.back();
    } catch (e) {
      setBusy(false);
      Alert.alert("Export failed", e instanceof Error ? e.message : "Couldn't build the package.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Export</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        {book && (
          <View style={styles.summary}>
            <Cover title={book.meta.title} seed={book.id} w={48} h={68} radius={6} fontSize={11} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bookTitle} numberOfLines={1}>{book.meta.title}</Text>
              <Text style={styles.bookMeta}>{book.meta.author} · {pages} {pages === 1 ? "page" : "pages"}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Preset</Text>
        <View style={styles.presetRow}>
          <Preset
            title="Full backup"
            sub="Photos · progress · words"
            active={presetName === "full"}
            onPress={() => setFlags(PRESETS.full)}
          />
          <Preset
            title="Share clean"
            sub="Fresh slate for a learner"
            active={presetName === "clean"}
            onPress={() => setFlags(PRESETS.clean)}
          />
        </View>

        <Text style={styles.label}>What to include</Text>
        <Toggle label="Page photos" value={flags.photos} onChange={(v) => setFlags({ ...flags, photos: v })} />
        <Toggle label="My progress" value={flags.progress} onChange={(v) => setFlags({ ...flags, progress: v })} />
        <Toggle label="Word list" value={flags.wordlist} onChange={(v) => setFlags({ ...flags, wordlist: v })} />
        {!flags.progress && (
          <Text style={styles.cleanNote}>Clean slate — whoever opens this starts fresh.</Text>
        )}

        <View style={styles.footerInfo}>
          <Text style={styles.fileName}>{fileName}</Text>
          <Text style={styles.size}>≈ {formatBytes(size)}</Text>
        </View>
        <Pressable style={[styles.exportBtn, busy && { opacity: 0.6 }]} onPress={onExport} disabled={busy}>
          <Feather name="share" size={18} color="#fff" />
          <Text style={styles.exportText}>{busy ? "Packaging…" : "Export .zip"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Preset({ title, sub, active, onPress }: { title: string; sub: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.preset, active && styles.presetOn]} onPress={onPress}>
      <Text style={[styles.presetTitle, active && { color: colors.ink }]}>{title}</Text>
      <Text style={styles.presetSub}>{sub}</Text>
    </Pressable>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.rule }}
        thumbColor="#fff"
      />
    </View>
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
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(3.5),
    marginBottom: spacing(5),
  },
  bookTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  bookMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: spacing(0.5) },
  label: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginBottom: spacing(2.5),
    marginTop: spacing(4),
  },
  presetRow: { flexDirection: "row", gap: spacing(3) },
  preset: { flex: 1, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.rule, padding: spacing(3.5) },
  presetOn: { borderColor: colors.accent, backgroundColor: colors.card },
  presetTitle: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
  presetSub: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkSoft, marginTop: spacing(1) },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing(2.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ruleSoft,
  },
  toggleLabel: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  cleanNote: { fontFamily: fonts.body, fontSize: 13, color: colors.good, marginTop: spacing(2) },
  footerInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing(6) },
  fileName: { fontFamily: fonts.uiRegular, fontSize: 13, color: colors.inkFaint },
  size: { fontFamily: fonts.ui, fontSize: 13, color: colors.inkSoft },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing(4),
    marginTop: spacing(3),
  },
  exportText: { fontFamily: fonts.uiSemibold, fontSize: 15.5, color: "#fff" },
});
