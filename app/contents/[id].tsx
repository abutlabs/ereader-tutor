// In-app book index: every page with its title and learned progress. Tap a row
// to jump straight to that page in the reader. Built when you mark a book
// complete, but available any time.

import { useCallback, useState } from "react";
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book } from "../../src/data/schema";
import { getBook } from "../../src/storage/books";
import { bookChapters } from "../../src/data/chapters";
import { loadLearned } from "../../src/storage/progress";
import { getBridgeUrl } from "../../src/storage/apiKey";
import { relabelPage } from "../../src/capture/scan";
import NumberPrompt from "../../src/components/NumberPrompt";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

interface Row {
  idx: number;
  page: number;
  detectedPage?: number | null;
  title?: string;
  total: number;
  learned: number;
  chapter?: number;
}
interface Section {
  key: string;
  title: string | null; // null = pages before the first chapter
  firstIdx: number;
  data: Row[];
}

export default function ContentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [relabel, setRelabel] = useState<number | null>(null); // page being re-labelled

  const refresh = useCallback(async () => {
    if (!id) return;
    const b = await getBook(id);
    setBook(b);
    if (!b) return;
    const next = await Promise.all(
      b.pages.map(async (p, idx) => {
        const sentences = p.paragraphs.flat();
        const learnedSet = await loadLearned(b.id, p.page);
        const learned = sentences.filter((s) => learnedSet.has(s.id)).length;
        return {
          idx,
          page: p.page,
          detectedPage: p.detectedPage,
          title: p.title,
          total: sentences.length,
          learned,
          chapter: p.chapter,
        };
      }),
    );
    setRows(next);
  }, [id]);

  // Reload on focus so learned counts reflect what you just read.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function onRelabel(oldNum: number, newNum: number) {
    setRelabel(null);
    try {
      const bridgeUrl = (await getBridgeUrl()) || undefined;
      const { bridgeError } = await relabelPage(id!, oldNum, newNum, bridgeUrl);
      await refresh();
      if (bridgeError) {
        Alert.alert("Re-labelled on phone", `Now page ${newNum}. Bridge note: ${bridgeError}`);
      }
    } catch (e) {
      Alert.alert("Couldn't re-label", e instanceof Error ? e.message : "Try a different number.");
    }
  }

  const totals = rows.reduce(
    (a, r) => ({ learned: a.learned + r.learned, total: a.total + r.total }),
    { learned: 0, total: 0 },
  );

  const open = (idx: number) =>
    router.push({ pathname: "/reader/[id]", params: { id: id!, start: String(idx) } });

  // Group pages under their chapters — from metadata when the bridge/import
  // supplied it, else derived from page titles, so the TOC never depends on a
  // sync. Books with no recognisable chapters get one unlabelled group.
  const sections: Section[] = [];
  const toc = book ? bookChapters(book) : null;
  const titleOf = (idx: number) => {
    const n = toc?.chapterOf(idx);
    return n == null ? null : (toc?.chapters.find((c) => c.number === n)?.title ?? `Chapter ${n}`);
  };
  for (const r of rows) {
    const t = titleOf(r.idx);
    const last = sections[sections.length - 1];
    if (last && last.title === t) last.data.push(r);
    else sections.push({ key: `${r.chapter ?? "none"}-${r.idx}`, title: t, firstIdx: r.idx, data: [r] });
  }
  const hasChapters = sections.some((s) => s.title);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book?.meta.title ?? "Contents"}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(r) => String(r.page)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: spacing(5), paddingTop: spacing(2) }}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <Pressable style={styles.chapterRow} onPress={() => open(section.firstIdx)}>
              <Text style={styles.chapterTitle}>{section.title}</Text>
              <Text style={styles.chapterMeta}>
                {section.data.length} page{section.data.length === 1 ? "" : "s"} · from p.{section.data[0].page}
              </Text>
              <Feather name="corner-down-right" size={16} color={colors.accent} />
            </Pressable>
          ) : hasChapters ? (
            <Text style={styles.frontMatter}>Front matter</Text>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.summaryRow}>
            <Text style={styles.summary}>
              {rows.length} page{rows.length === 1 ? "" : "s"}
            </Text>
            <Text style={styles.summary}>
              {totals.learned}/{totals.total} learned
            </Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No pages yet.</Text>}
        renderItem={({ item }) => {
          const done = item.total > 0 && item.learned === item.total;
          const mismatch =
            item.detectedPage != null && item.detectedPage !== item.page;
          return (
            <Pressable
              style={styles.row}
              onPress={() => open(item.idx)}
              onLongPress={() => setRelabel(item.page)}
            >
              <Text style={styles.pageNum}>Page {item.page}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title || "—"}
                </Text>
                <Text style={styles.rowProgress}>
                  {item.learned}/{item.total} learned
                  {mismatch ? `  ·  printed “${item.detectedPage}” — hold to re-label` : ""}
                </Text>
              </View>
              {mismatch ? (
                <Feather name="alert-triangle" size={16} color={colors.accent} />
              ) : done ? (
                <Feather name="check-circle" size={18} color={colors.good} />
              ) : (
                <Feather name="chevron-right" size={20} color={colors.rule} />
              )}
            </Pressable>
          );
        }}
      />

      <NumberPrompt
        visible={relabel != null}
        title="Re-label this page"
        message={`Currently page ${relabel ?? ""}. Enter its real number in the book.`}
        initial={relabel ?? undefined}
        confirmLabel="Re-label"
        onCancel={() => setRelabel(null)}
        onConfirm={(newNum) => relabel != null && onRelabel(relabel, newNum)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    marginTop: spacing(5),
    marginBottom: spacing(2),
    paddingBottom: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  chapterTitle: { flex: 1, fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  chapterMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft },
  frontMatter: { fontFamily: fonts.body, fontSize: 12, color: colors.inkSoft, marginTop: spacing(4), marginBottom: spacing(1) },
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, flex: 1, textAlign: "center" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing(3),
  },
  summary: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkSoft },
  empty: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing(10),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingVertical: spacing(3.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  pageNum: { fontFamily: fonts.display, fontSize: 15, color: colors.accent, width: 64 },
  rowTitle: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  rowProgress: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkSoft, marginTop: spacing(0.5) },
});
