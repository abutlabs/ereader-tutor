// The reader — flowing, tappable Dutch text with a drop cap, page navigation,
// learned-progress, and the tap-to-translate sheet. Audio uses native voices.

import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book, Figure, Sentence } from "../../src/data/schema";
import { getBook } from "../../src/storage/books";
import {
  type DailyState,
  loadDaily,
  loadLastPageIdx,
  loadLearned,
  recordLearned,
  saveLastPageIdx,
  saveLearned,
} from "../../src/storage/progress";
import { loadWordlist, savedKeys, toggleWord } from "../../src/storage/wordlist";
import { onSpeakingChange, speak, stop } from "../../src/audio/speech";
import SentenceSheet from "../../src/components/SentenceSheet";
import { bookChapters } from "../../src/data/chapters";
import Ring from "../../src/components/Ring";
import Flame from "../../src/components/Flame";
import SessionComplete from "../../src/components/SessionComplete";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

const FOCUS_DIM = 0.32; // opacity of non-active text while a sentence is focused

export default function ReaderScreen() {
  const { id, start } = useLocalSearchParams<{ id: string; start?: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [active, setActive] = useState<Sentence | null>(null);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [slow, setSlow] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [imageRatio, setImageRatio] = useState<number | null>(null); // page photo w/h
  const [zoomed, setZoomed] = useState<string | null>(null); // uri of the image shown full-screen
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [sessionDone, setSessionDone] = useState(false);
  const hydrated = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadDaily().then(setDaily);
  }, []);

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

  // Load this book's saved word list (per book, not per page).
  useEffect(() => {
    if (id) loadWordlist(id).then((items) => setSavedWords(savedKeys(items)));
  }, [id]);

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
  // A page with artwork but no text (a map, a full-page illustration) is shown
  // whole so it can be matched against the physical book; text pages keep a
  // strip of the page photo that opens full-screen on tap.
  const pictureOnly = allSentences.length === 0 && !!page?.imageUri;
  // Illustrations extracted from a PDF page, keyed by the paragraph they follow.
  const figuresAfter = useMemo(() => {
    const m = new Map<number, Figure[]>();
    const n = page?.paragraphs.length ?? 0;
    for (const f of page?.figures ?? []) {
      const k = Math.max(0, Math.min(n, f.afterParagraph));
      m.set(k, [...(m.get(k) ?? []), f]);
    }
    return m;
  }, [page]);
  const renderFigures = (k: number) =>
    (figuresAfter.get(k) ?? []).map((f) => (
      <Pressable key={f.uri} onPress={() => setZoomed(f.uri)} accessibilityLabel="Show the illustration full-screen">
        <Image
          source={{ uri: f.uri }}
          style={[styles.figure, { aspectRatio: f.width && f.height ? f.width / f.height : 4 / 3 }, focusing && styles.dim]}
          resizeMode="contain"
        />
      </Pressable>
    ));
  useEffect(() => {
    setImageRatio(null);
    setZoomed(null);
    if (!page?.imageUri) return;
    let live = true;
    Image.getSize(
      page.imageUri,
      (w, h) => live && h > 0 && setImageRatio(w / h),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [page?.imageUri]);

  function onSpeak(text: string, localId: string) {
    // The sentence button prefers the bridge-narrated recording once synced;
    // word taps stay on the native voice (only sentences are narrated).
    const audioUrl = localId === "sentence" ? active?.audioUrl : undefined;
    speak(text, localId, { language: lang, slow, audioUrl });
  }

  async function toggleLearned() {
    if (!active) return;
    const wasLearned = learned.has(active.id);
    setLearned((prev) => {
      const next = new Set(prev);
      wasLearned ? next.delete(active.id) : next.add(active.id);
      return next;
    });
    // Count momentum only on a fresh learn; fire Session Complete on the goal.
    if (!wasLearned) {
      const d = await recordLearned();
      setDaily(d);
      if (d.justCompleted) setSessionDone(true);
    }
  }

  async function onToggleWord(w: { nl: string; en: string }) {
    if (!book) return;
    const next = await toggleWord(book.id, w, page?.page);
    setSavedWords(savedKeys(next));
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
        <ReaderHeader title="" onBack={() => router.back()} daily={null} />
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const total = book.pages.length;
  const focusing = active != null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ReaderHeader
        title={book.meta.title}
        subtitle={`${page.title ? page.title + " · " : ""}p.${page.page}`}
        onBack={() => router.back()}
        onContents={() => router.push({ pathname: "/contents/[id]", params: { id: id! } })}
        daily={daily}
      />

      {/* Contents shortcut — the book's table of contents, one tap from any page */}
      <Pressable
        style={styles.tocBtn}
        onPress={() => router.push({ pathname: "/contents/[id]", params: { id: id! } })}
        hitSlop={8}
        accessibilityLabel="Table of contents"
      >
        <Feather name="list" size={16} color={colors.inkSoft} />
        <Text style={styles.tocText} numberOfLines={1}>
          {(() => {
            const toc = bookChapters(book);
            const n = toc.chapterOf(pageIdx);
            return (n != null && toc.chapters.find((c) => c.number === n)?.title) || "Contents";
          })()}
        </Text>
      </Pressable>

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
        {page.imageUri ? (
          <Pressable onPress={() => setZoomed(page.imageUri!)} accessibilityLabel="Show the page photo full-screen">
            <Image
              source={{ uri: page.imageUri }}
              style={[
                pictureOnly
                  ? [styles.pageImageFull, { aspectRatio: imageRatio ?? 0.75 }]
                  : styles.pageImage,
                focusing && styles.dim,
              ]}
              resizeMode={pictureOnly ? "contain" : "cover"}
            />
          </Pressable>
        ) : null}
        {page.title ? (
          <Text style={[styles.chapterTitle, focusing && styles.dim]}>{page.title}</Text>
        ) : null}
        {page.preamble ? (
          <Text style={[styles.preamble, focusing && styles.dim]}>{page.preamble}</Text>
        ) : null}
        {renderFigures(0)}

        {page.paragraphs.map((para, pi) => (
          <View key={pi}>
          <Text style={styles.paragraph}>
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
                      focusing && !isActive && styles.dim,
                      isActive && styles.sentenceActive,
                    ]}
                  >
                    <Text style={styles.dropCap}>{first}</Text>
                    {rest + " "}
                    {isLearned ? <Text style={styles.learnedCheck}>{"✓ "}</Text> : null}
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
                    focusing && !isActive && styles.dim,
                    isActive && styles.sentenceActive,
                  ]}
                >
                  {s.dutch + " "}
                  {isLearned ? <Text style={styles.learnedCheck}>{"✓ "}</Text> : null}
                </Text>
              );
            })}
          </Text>
          {renderFigures(pi + 1)}
          </View>
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

      {/* Full-screen image — a page photo or an illustration, to find your place in the physical book. */}

      <Modal visible={!!zoomed} transparent animationType="fade" onRequestClose={() => setZoomed(null)}>

        <Pressable style={styles.zoomBackdrop} onPress={() => setZoomed(null)}>

          {zoomed ? <Image source={{ uri: zoomed }} style={styles.zoomImage} resizeMode="contain" /> : null}

          <Text style={styles.zoomHint}>

            {page?.title ? `${page.title} · ` : ""}page {page?.page} · tap to close

          </Text>

        </Pressable>

      </Modal>


      <SentenceSheet
        sentence={active}
        language={lang}
        learned={active ? learned.has(active.id) : false}
        slow={slow}
        speakingId={speakingId}
        savedWords={savedWords}
        onSpeak={onSpeak}
        onToggleSlow={() => setSlow((v) => !v)}
        onToggleLearned={toggleLearned}
        onToggleWord={onToggleWord}
        onClose={() => {
          stop();
          setActive(null);
        }}
      />

      <SessionComplete
        visible={sessionDone}
        goal={daily?.goal ?? 20}
        streak={daily?.streak ?? 0}
        onClose={() => setSessionDone(false)}
      />
    </SafeAreaView>
  );
}

function ReaderHeader({
  title,
  subtitle,
  onBack,
  onContents,
  daily,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onContents?: () => void;
  daily: DailyState | null;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10} style={{ marginRight: spacing(1) }}>
        <Feather name="chevron-left" size={24} color={colors.ink} />
      </Pressable>
      {onContents ? (
        <Pressable onPress={onContents} hitSlop={10} style={{ marginRight: spacing(2) }} accessibilityLabel="Table of contents">
          <Feather name="list" size={22} color={colors.accent} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {daily && (
        <View style={styles.headerRight}>
          <Ring value={daily.count} total={daily.goal} size={42} stroke={4}>
            <Text style={styles.headerRingCount}>{daily.count}</Text>
          </Ring>
          {daily.streak > 0 && <Flame n={daily.streak} soft />}
        </View>
      )}
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
    gap: spacing(2),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    backgroundColor: colors.paperWarm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ruleSoft,
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 15.5, color: colors.ink },
  headerSub: { fontFamily: fonts.ui, fontSize: 11, color: colors.inkFaint, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  headerRingCount: { fontFamily: fonts.uiBold, fontSize: 11, color: colors.ink },
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
  pageImage: {
    width: "100%",
    height: 240,
    borderRadius: radius.md,
    marginBottom: spacing(5),
    backgroundColor: colors.paperSoft,
  },
  figure: {
    width: "100%",
    borderRadius: radius.md,
    marginBottom: spacing(5),
    backgroundColor: colors.paperSoft,
  },
  tocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    alignSelf: "center",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
  },
  tocText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  pageImageFull: {
    width: "100%",
    borderRadius: radius.md,
    marginBottom: spacing(5),
    backgroundColor: colors.paperSoft,
  },
  zoomBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20, 16, 12, 0.96)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing(3),
  },
  zoomImage: { width: "100%", height: "88%" },
  zoomHint: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: spacing(3),
  },
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
  sentenceActive: {
    backgroundColor: colors.accentSoft,
    textDecorationLine: "underline",
    textDecorationColor: colors.accent,
  },
  sentenceLearned: { color: colors.inkSoft },
  dim: { opacity: 0.32 },
  learnedCheck: { color: colors.good, fontFamily: fonts.uiRegular, fontSize: 14 },
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
