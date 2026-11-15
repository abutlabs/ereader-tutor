// Pen notes — every book page you've written on, with JSON export (share /
// save to files) and import (merges; strokes already here are skipped).
// Notes live only on this device until exported.

import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { getBook } from "../src/storage/books";
import { clearBookNotes, exportNotes, importNotes, listNotes, type NotesSummary } from "../src/notes/store";
import { cardEdge, colors, fonts, radius, spacing } from "../src/theme/theme";
import { FORM_COLUMN, TOUCH } from "../src/theme/layout";

export default function NotesScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<NotesSummary[] | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    listNotes().then(setBooks).catch(() => setBooks([]));
  }, []);
  useFocusEffect(refresh);

  async function openPage(bookId: string, pageNo: number) {
    const b = await getBook(bookId);
    const idx = b?.pages.findIndex((p) => p.page === pageNo) ?? -1;
    if (!b || idx < 0) {
      Alert.alert("Page not found", "That book or page isn't on this device.");
      return;
    }
    router.push({ pathname: "/reader/[id]", params: { id: bookId, start: String(idx) } });
  }

  async function onExport() {
    setBusy(true);
    try {
      const data = await exportNotes();
      const name = `ereader-tutor-notes-${new Date().toISOString().slice(0, 10)}.json`;
      const uri = `${FileSystem.cacheDirectory}${name}`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(data));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Export pen notes" });
      } else {
        Alert.alert("Exported", `Saved to ${uri}`);
      }
    } catch (e) {
      Alert.alert("Export failed", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onImport() {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", "*/*"],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setBusy(true);
    try {
      const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const { books: n, added } = await importNotes(JSON.parse(text));
      refresh();
      Alert.alert(
        "Notes imported",
        added ? `${added} stroke${added === 1 ? "" : "s"} added to ${n} book${n === 1 ? "" : "s"}.` : "Nothing new — those notes are already here.",
      );
    } catch (e) {
      Alert.alert("Couldn't import", e instanceof Error ? e.message : "Not a notes file.");
    } finally {
      setBusy(false);
    }
  }

  function onClearBook(b: NotesSummary) {
    Alert.alert("Delete all notes?", `Every pen note in "${b.title}". This can't be undone — export first to keep a copy.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await clearBookNotes(b.bookId);
          refresh();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Pen notes</Text>
        <View style={styles.iconBtn}>{busy ? <ActivityIndicator color={colors.ink} /> : null}</View>
      </View>

      <ScrollView contentContainerStyle={FORM_COLUMN}>
        <Text style={styles.help}>
          Write on any page with the stylus; a finger still scrolls and taps. Notes are kept on this
          device only — export them to back up or move to another device.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={onExport} disabled={busy}>
            <Feather name="upload" size={18} color={colors.ink} />
            <Text style={styles.actionText}>Export JSON</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={onImport} disabled={busy}>
            <Feather name="download" size={18} color={colors.ink} />
            <Text style={styles.actionText}>Import JSON</Text>
          </Pressable>
        </View>

        {books && books.length === 0 ? (
          <Text style={styles.empty}>No notes yet. Open a book and write in the margin with the pen.</Text>
        ) : null}

        {(books ?? []).map((b) => (
          <View key={b.bookId} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle} numberOfLines={2}>{b.title}</Text>
                <Text style={styles.meta}>
                  {b.strokes} stroke{b.strokes === 1 ? "" : "s"} on {b.pages.length} page{b.pages.length === 1 ? "" : "s"}
                </Text>
              </View>
              <Pressable onPress={() => onClearBook(b)} style={styles.iconBtn} accessibilityLabel={`Delete notes in ${b.title}`}>
                <Feather name="trash-2" size={18} color={colors.inkSoft} />
              </Pressable>
            </View>
            <View style={styles.pages}>
              {b.pages.map((p) => (
                <Pressable key={p.page} style={styles.pageChip} onPress={() => openPage(b.bookId, p.page)}>
                  <Text style={styles.pageText}>p.{p.page}</Text>
                  <Text style={styles.pageCount}>{p.count}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  iconBtn: { minWidth: TOUCH, minHeight: TOUCH, alignItems: "center", justifyContent: "center" },
  help: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft, marginBottom: spacing(4) },
  actions: { flexDirection: "row", gap: spacing(3), marginBottom: spacing(6) },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    minHeight: TOUCH,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  actionText: { fontFamily: fonts.ui, fontSize: 15, color: colors.ink },
  empty: { fontFamily: fonts.bodyItalic, fontStyle: "italic", fontSize: 15, color: colors.inkSoft, textAlign: "center" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(4),
    marginBottom: spacing(3),
    ...cardEdge,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  bookTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  meta: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkFaint, marginTop: spacing(0.5) },
  pages: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2), marginTop: spacing(3) },
  pageChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    minHeight: TOUCH,
    minWidth: TOUCH + 16,
    justifyContent: "center",
    paddingHorizontal: spacing(3),
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  pageText: { fontFamily: fonts.ui, fontSize: 15, color: colors.ink },
  pageCount: { fontFamily: fonts.ui, fontSize: 11, color: colors.inkFaint },
});
