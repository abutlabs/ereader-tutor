// Library (home) — Hearth redesign. Your books and daily momentum: a greeting,
// a daily-goal ring, a continue-reading hero, your books, and add actions.

import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { BookSummary } from "../src/data/schema";
import { createBook, deleteBook, getBook, listBooks } from "../src/storage/books";
import {
  loadDaily,
  loadLastPageIdx,
  loadLearned,
  type DailyState,
} from "../src/storage/progress";
import Ring from "../src/components/Ring";
import Flame from "../src/components/Flame";
import Cover from "../src/components/Cover";
import ProgressBar from "../src/components/ProgressBar";
import { colors, fonts, radius, spacing } from "../src/theme/theme";

interface BookCard {
  summary: BookSummary;
  learned: number;
  total: number;
}
interface Continue {
  id: string;
  title: string;
  pageTitle: string;
  author: string;
  pageNo: number;
  learned: number;
  total: number;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen,";
  if (h < 18) return "Goedemiddag,";
  return "Goedenavond,";
}

async function bookProgress(id: string): Promise<{ learned: number; total: number }> {
  const book = await getBook(id);
  if (!book) return { learned: 0, total: 0 };
  let total = 0;
  let learned = 0;
  for (const p of book.pages) {
    total += p.paragraphs.reduce((a, para) => a + para.length, 0);
    learned += (await loadLearned(id, p.page)).size;
  }
  return { learned, total };
}

export default function LibraryScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<BookCard[]>([]);
  const [cont, setCont] = useState<Continue | null>(null);
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const refresh = useCallback(() => {
    (async () => {
      setDaily(await loadDaily());
      const summaries = await listBooks();
      const next = await Promise.all(
        summaries.map(async (s) => ({ summary: s, ...(await bookProgress(s.id)) })),
      );
      setCards(next);

      const top = summaries[0];
      if (top) {
        const full = await getBook(top.id);
        const idx = Math.min(await loadLastPageIdx(top.id), Math.max((full?.pages.length ?? 1) - 1, 0));
        const pg = full?.pages[idx];
        const prog = next.find((c) => c.summary.id === top.id);
        setCont({
          id: top.id,
          title: top.title,
          pageTitle: pg?.title || `Page ${pg?.page ?? idx + 1}`,
          author: top.author,
          pageNo: pg?.page ?? idx + 1,
          learned: prog?.learned ?? 0,
          total: prog?.total ?? 0,
        });
      } else {
        setCont(null);
      }
    })();
  }, []);

  useFocusEffect(useCallback(() => refresh(), [refresh]));

  async function onCreate() {
    if (!title.trim()) return;
    const book = await createBook({
      title: title.trim(),
      author: author.trim() || "Unknown",
      language: "nl-NL",
    });
    setTitle("");
    setAuthor("");
    setCreating(false);
    router.push(`/book/${book.id}`);
  }

  function onLongPress(b: BookSummary) {
    if (b.id === "dik-trom") return;
    Alert.alert("Delete project?", `"${b.title}" and its scans.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteBook(b.id); refresh(); } },
    ]);
  }

  const goal = daily?.goal ?? 20;
  const count = daily?.count ?? 0;
  const streak = daily?.streak ?? 0;
  const remaining = Math.max(goal - count, 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Greeting header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.h1}>Your library</Text>
        </View>
        <View style={styles.headerActions}>
          {streak > 0 && <Flame n={streak} />}
          <Pressable onPress={() => router.push("/settings")} hitSlop={10} style={styles.gear}>
            <Feather name="settings" size={21} color={colors.inkSoft} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(5), paddingTop: spacing(2) }}>
        {/* Daily goal card */}
        <View style={styles.dailyCard}>
          <Ring value={count} total={goal} size={58} stroke={5}>
            <Text style={styles.ringCount}>{count}</Text>
            <Text style={styles.ringGoal}>/ {goal}</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Text style={styles.dailyTitle}>Today's goal</Text>
            <Text style={styles.dailyLine}>
              {remaining > 0
                ? `${remaining} more sentence${remaining === 1 ? "" : "s"} to keep your ${Math.max(streak, 1)}-day streak.`
                : "Goal complete — streak safe for today."}
            </Text>
          </View>
        </View>

        {/* Continue reading hero */}
        {cont && (
          <Pressable
            style={styles.hero}
            onPress={() => router.push({ pathname: "/reader/[id]", params: { id: cont.id } })}
          >
            <Cover title={cont.title} seed={cont.id} w={66} h={92} radius={8} />
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>CONTINUE READING</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>{cont.pageTitle}</Text>
              <Text style={styles.heroAuthor} numberOfLines={1}>{cont.author}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2), marginTop: spacing(2) }}>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={cont.learned} total={cont.total} gradient height={5} />
                </View>
                <Text style={styles.pageNo}>p.{cont.pageNo}</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Your books */}
        <Text style={styles.sectionLabel}>Your books</Text>
        {cards.map(({ summary: b, learned, total }) => {
          const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
          return (
            <Pressable
              key={b.id}
              style={styles.row}
              onPress={() => router.push(`/book/${b.id}`)}
              onLongPress={() => onLongPress(b)}
            >
              <Cover title={b.title} seed={b.id} w={50} h={70} radius={6} complete={b.status === "complete"} fontSize={12} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{b.title}</Text>
                <Text style={styles.rowAuthor} numberOfLines={1}>{b.author}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing(2), marginTop: spacing(1.5) }}>
                  <View style={{ flex: 1 }}>
                    <ProgressBar value={learned} total={total} height={4} />
                  </View>
                  <Text style={styles.rowPct}>{b.status === "complete" && pct === 100 ? "Done" : `${pct}%`}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.rule} />
            </Pressable>
          );
        })}

        {/* Add cluster */}
        {creating ? (
          <View style={styles.createBox}>
            <TextInput
              placeholder="Book title (e.g. Otje)"
              placeholderTextColor={colors.inkFaint}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              autoFocus
            />
            <TextInput
              placeholder="Author (optional)"
              placeholderTextColor={colors.inkFaint}
              value={author}
              onChangeText={setAuthor}
              style={styles.input}
            />
            <View style={styles.createActions}>
              <Pressable onPress={() => setCreating(false)} hitSlop={8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.createBtn} onPress={onCreate}>
                <Text style={styles.createBtnText}>Create</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Pressable style={styles.newBtn} onPress={() => setCreating(true)}>
              <Feather name="plus" size={20} color={colors.accent} />
              <Text style={styles.newBtnText}>New book</Text>
            </Pressable>
            <Pressable style={styles.textBtn} onPress={() => router.push("/import")}>
              <Feather name="download" size={17} color={colors.inkSoft} />
              <Text style={styles.textBtnLabel}>Import a book from a .zip</Text>
            </Pressable>
            <Pressable style={styles.textBtn} onPress={() => router.push("/add")}>
              <Feather name="book" size={17} color={colors.inkSoft} />
              <Text style={styles.textBtnLabel}>Read an EPUB or library loan</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing(5),
    paddingTop: spacing(5),
    paddingBottom: spacing(1),
  },
  greeting: { fontFamily: fonts.ui, fontSize: 13, color: colors.inkFaint, marginBottom: spacing(0.5) },
  h1: { fontFamily: fonts.displayBold, fontSize: 27, letterSpacing: -0.4, color: colors.ink },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  gear: { padding: spacing(1) },

  dailyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(4),
    backgroundColor: colors.cardDeep,
    borderRadius: 18,
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(4.5),
    marginBottom: spacing(4),
  },
  ringCount: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.ink, lineHeight: 20 },
  ringGoal: { fontFamily: fonts.ui, fontSize: 10.5, color: colors.inkFaint },
  dailyTitle: { fontFamily: fonts.display, fontSize: 16.5, color: colors.ink },
  dailyLine: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: colors.inkSoft, marginTop: spacing(1) },

  hero: {
    flexDirection: "row",
    gap: spacing(4),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginBottom: spacing(5),
    shadowColor: "#281c11",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  kicker: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.accent,
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink, marginTop: spacing(1.5), lineHeight: 24 },
  heroAuthor: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft, marginTop: spacing(0.5) },
  pageNo: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkFaint },

  sectionLabel: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginBottom: spacing(3),
    marginTop: spacing(1),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3.5),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(3.5),
    marginBottom: spacing(3),
  },
  rowTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  rowAuthor: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginTop: spacing(0.5) },
  rowPct: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkFaint, minWidth: 34, textAlign: "right" },

  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(4),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: "dashed",
    marginTop: spacing(2),
  },
  newBtnText: { fontFamily: fonts.uiSemibold, fontSize: 15.5, color: colors.accent },
  textBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(3),
    marginTop: spacing(2),
  },
  textBtnLabel: { fontFamily: fonts.ui, fontSize: 14, color: colors.inkSoft },
  createBox: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(4),
    gap: spacing(3),
    marginTop: spacing(2),
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: spacing(2),
  },
  createActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: spacing(5), marginTop: spacing(1) },
  cancelText: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
  createBtn: { backgroundColor: colors.accent, paddingVertical: spacing(2.5), paddingHorizontal: spacing(6), borderRadius: radius.pill },
  createBtnText: { fontFamily: fonts.uiSemibold, fontSize: 15, color: "#fff" },
});
