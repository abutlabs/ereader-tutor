// The reader — flowing, tappable Dutch text with a drop cap, page navigation,
// learned-progress, and the tap-to-translate sheet. Audio uses native voices.

import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book, Sentence } from "../../src/data/schema";
import { getBook } from "../../src/storage/books";
import {
  loadLastPageIdx,
  loadLearned,
  saveLastPageIdx,
  saveLearned,
} from "../../src/storage/progress";
import { onSpeakingChange, speak, stop } from "../../src/audio/speech";
import SentenceSheet from "../../src/components/SentenceSheet";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

export default function ReaderScreen() {
  const { id, start } = useLocalSearchParams<{ id: string; start?: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [active, setActive] = useState<Sentence | null>(null);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [slow, setSlow] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const hydrated = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  // Load book once; pick the initial page from `start`, else the saved position.
  useEffect(() => {
    if (!id) return;
    (async () => {
      const b = await getBook(id);
      setBook(b);
      if (b && b.pages.length > 0) {
        const fromParam = start != null ? parseInt(start, 10) : NaN;
        const initial = Number.isFinite(fromParam)
          ? fromParam
          : await loadLastPageIdx(id);
        setPageIdx(Math.min(Math.max(initial, 0), b.pages.length - 1));
      }
    })();
  }, [id, start]);

  const page = book?.pages[pageIdx] ?? null;
  const lang = book?.meta.language ?? "nl-NL";

  // Subscribe to the shared speech state so highlights reflect what's playing.
  useEffect(() => onSpeakingChange(setSpeakingId), []);
  // Stop audio when leaving the screen.
  useEffect(() => () => stop(), []);

  // Load this page's learned set on page change; persist position.
  useEffect(() => {
    if (!book || !page) return;
    hydrated.current = false;
    loadLearned(book.id, page.page).then((s) => {
      setLearned(s);
      hydrated.current = true;
    });
    saveLastPageIdx(book.id, pageIdx);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [book, pageIdx]);

  // Save learned set when it changes (after hydration, to avoid clobbering).
  useEffect(() => {
    if (!book || !page || !hydrated.current) return;
    saveLearned(book.id, page.page, learned);
  }, [learned]);

  const allSentences = useMemo(
    () => (page ? page.paragraphs.flat() : []),
    [page],
  );
  const doneCount = allSentences.filter((s) => learned.has(s.id)).length;

  function onSpeak(text: string, localId: string) {
    speak(text, localId, { language: lang, slow });
  }

  function toggleLearned() {
    if (!active) return;
    setLearned((prev) => {
      const next = new Set(prev);
      next.has(active.id) ? next.delete(active.id) : next.add(active.id);
      return next;
    });
  }

  function goTo(idx: number) {
    if (!book) return;
    stop();
    setActive(null);
    setPageIdx(Math.min(Math.max(idx, 0), book.pages.length - 1));
  }

  if (!book || !page) {
    return (
      <SafeAreaView style={styles.safe}>
        <ReaderHeader title="" onBack={() => router.back()} progress="" />
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const total = book.pages.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ReaderHeader
        title={book.meta.title}
        onBack={() => router.back()}
        progress={`${doneCount}/${allSentences.length} learned`}
      />

      {/* Top page nav */}
      <PageNav
        idx={pageIdx}
        total={total}
        onPrev={() => goTo(pageIdx - 1)}
        onNext={() => goTo(pageIdx + 1)}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        {page.title ? <Text style={styles.chapterTitle}>{page.title}</Text> : null}
        {page.preamble ? <Text style={styles.preamble}>{page.preamble}</Text> : null}

        {page.paragraphs.map((para, pi) => (
          <Text key={pi} style={styles.paragraph}>
            {para.map((s, si) => {
              const isActive = active?.id === s.id;
              const isLearned = learned.has(s.id);
              // Drop cap on the very first sentence of the page.
              if (pi === 0 && si === 0 && s.dutch.length > 0) {
                const first = s.dutch[0];
                const rest = s.dutch.slice(1);
                return (
                  <Text
                    key={s.id}
                    onPress={() => setActive(s)}
                    style={[
                      styles.sentence,
                      isLearned && styles.sentenceLearned,
                      isActive && styles.sentenceActive,
                    ]}
                  >
                    <Text style={styles.dropCap}>{first}</Text>
                    {rest + " "}
                  </Text>
                );
              }
              return (
                <Text
                  key={s.id}
                  onPress={() => setActive(s)}
                  style={[
                    styles.sentence,
                    isLearned && styles.sentenceLearned,
                    isActive && styles.sentenceActive,
                  ]}
                >
                  {s.dutch + " "}
                </Text>
              );
            })}
          </Text>
        ))}

        <Text style={styles.ornament}>⁂</Text>
        <Text style={styles.pageFooter}>
          {pageIdx === total - 1 ? "End of book so far" : `Page ${pageIdx + 1}`}
        </Text>
      </ScrollView>

      {/* Bottom page nav */}
      <PageNav
        idx={pageIdx}
        total={total}
        onPrev={() => goTo(pageIdx - 1)}
        onNext={() => goTo(pageIdx + 1)}
        filled
      />

      <SentenceSheet
        sentence={active}
        language={lang}
        learned={active ? learned.has(active.id) : false}
        slow={slow}
        speakingId={speakingId}
        onSpeak={onSpeak}
        onToggleSlow={() => setSlow((v) => !v)}
        onToggleLearned={toggleLearned}
        onClose={() => {
          stop();
          setActive(null);
        }}
      />
    </SafeAreaView>
  );
}

function ReaderHeader({
  title,
  onBack,
  progress,
}: {
  title: string;
  onBack: () => void;
  progress: string;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10}>
        <Feather name="book-open" size={22} color={colors.accent} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.headerProgress}>{progress}</Text>
    </View>
  );
}

function PageNav({
  idx,
  total,
  onPrev,
  onNext,
  filled,
}: {
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  filled?: boolean;
}) {
  if (total <= 1) return <View style={{ height: filled ? spacing(2) : 0 }} />;
  const atStart = idx === 0;
  const atEnd = idx === total - 1;
  const Btn = ({
    dir,
    disabled,
    onPress,
  }: {
    dir: "prev" | "next";
    disabled: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.navBtn,
        filled && !disabled && styles.navBtnFilled,
        disabled && styles.navBtnDisabled,
      ]}
    >
      <Feather
        name={dir === "prev" ? "chevron-left" : "chevron-right"}
        size={18}
        color={
          disabled
            ? colors.rule
            : filled
              ? colors.paper
              : colors.accent
        }
      />
      <Text
        style={[
          styles.navText,
          filled && !disabled && { color: colors.paper },
          disabled && { color: colors.rule },
        ]}
      >
        {dir === "prev" ? "Prev" : "Next"}
      </Text>
    </Pressable>
  );
  return (
    <View style={styles.navRow}>
      <Btn dir="prev" disabled={atStart} onPress={onPrev} />
      <Text style={styles.navCount}>
        {idx + 1} / {total}
      </Text>
      <Btn dir="next" disabled={atEnd} onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  loading: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.ink, flex: 1 },
  headerProgress: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkSoft },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2.5),
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  navBtnFilled: { backgroundColor: colors.accent },
  navBtnDisabled: { borderColor: colors.rule },
  navText: { fontFamily: fonts.ui, fontSize: 14, color: colors.accent },
  navCount: { fontFamily: fonts.ui, fontSize: 13, color: colors.inkSoft },
  page: { paddingHorizontal: spacing(6), paddingVertical: spacing(4) },
  chapterTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
    marginBottom: spacing(4),
  },
  preamble: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 26,
    color: colors.inkSoft,
    marginBottom: spacing(3),
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: 19,
    lineHeight: 32,
    color: colors.ink,
    marginBottom: spacing(4),
  },
  sentence: { color: colors.ink },
  sentenceActive: { backgroundColor: colors.accentSoft },
  sentenceLearned: { color: colors.inkSoft },
  dropCap: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 40,
    color: colors.accent,
  },
  ornament: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.rule,
    textAlign: "center",
    marginTop: spacing(6),
  },
  pageFooter: {
    fontFamily: fonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.rule,
    textAlign: "center",
    marginTop: spacing(2),
    marginBottom: spacing(6),
  },
});
