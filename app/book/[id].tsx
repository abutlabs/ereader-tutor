// Book view — the table of contents and the capture entry point: photograph a
// page, Claude turns it into a lesson, and it appends here. (Capture uses the
// system camera/gallery for now; Phase 1 swaps in the ML Kit document scanner.)

import { useCallback, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book } from "../../src/data/schema";
import { getBook } from "../../src/storage/books";
import {
  getApiKey,
  getBridgeUrl,
  getModel,
  getSource,
} from "../../src/storage/apiKey";
import {
  captureImage,
  CaptureSource,
  processScan,
  queueBridgeScan,
  syncFromBridge,
  TranslateConfig,
} from "../../src/capture/scan";
import ScanOverlay, { ScanPhase } from "../../src/components/ScanOverlay";
import NumberPrompt from "../../src/components/NumberPrompt";
import { loadWordlist } from "../../src/storage/wordlist";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

interface Pending {
  asset: { uri: string; width?: number; height?: number };
  cfg: TranslateConfig;
  page?: number; // book page number the user labelled this scan with (bridge)
}

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [scan, setScan] = useState<ScanPhase | null>(null);
  const [pagePrompt, setPagePrompt] = useState<Pending | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const pending = useRef<Pending | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getBook(id).then(setBook);
      loadWordlist(id).then((items) => setWordCount(items.length));
    }, [id]),
  );

  // Run the capture pipeline for an already-captured asset. The bridge path is
  // fire-and-forget (queue and free up); the API path runs to completion.
  async function runPipeline(p: Pending) {
    if (!book) return;
    pending.current = p;
    setScan({ k: "working", label: "Preparing the image…" });
    try {
      if (p.cfg.source === "bridge") {
        const { page } = await queueBridgeScan(
          book.id,
          p.asset,
          p.cfg,
          (label) => setScan({ k: "working", label }),
          p.page,
        );
        setScan({ k: "queued", page });
      } else {
        const { book: updated, pageIdx } = await processScan(
          book.id,
          p.asset,
          p.cfg,
          (label) => setScan({ k: "working", label }),
        );
        setBook(updated);
        setScan({ k: "done", pageIdx });
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      setScan({ k: "error", message });
    }
  }

  // Resolve the translation source (API key or local bridge). Returns a config,
  // or null after prompting the user to finish setup in Settings.
  async function resolveConfig(): Promise<TranslateConfig | null> {
    const source = await getSource();
    const model = await getModel();
    if (source === "bridge") {
      const bridgeUrl = await getBridgeUrl();
      if (!bridgeUrl) {
        promptSettings(
          "Set the bridge URL",
          "You're set to use the local Claude Code bridge. Add its URL in Settings.",
        );
        return null;
      }
      return { source: "bridge", bridgeUrl, model };
    }
    const apiKey = await getApiKey();
    if (!apiKey) {
      promptSettings(
        "Add your API key first",
        "Scanning sends the page to Claude. Add your Anthropic key in Settings — or switch to the local Claude Code bridge.",
      );
      return null;
    }
    return { source: "api", apiKey, model };
  }

  // Pull pages the bridge already finished into this book (recovers work the
  // phone never received, and imports pages produced while the app was closed).
  async function onSyncPress() {
    if (!book) return;
    const bridgeUrl = await getBridgeUrl();
    if (!bridgeUrl) {
      promptSettings(
        "Set the bridge URL",
        "Syncing pulls finished pages from the local Claude Code bridge. Add its URL in Settings.",
      );
      return;
    }
    setScan({ k: "working", label: "Checking the bridge…" });
    try {
      const { book: updated, imported, available, processing } = await syncFromBridge(
        book.id,
        bridgeUrl,
        (label) => setScan({ k: "working", label }),
      );
      if (updated) setBook(updated);
      setScan(null);
      const stillGoing = processing
        ? ` ${processing} page${processing === 1 ? "" : "s"} still processing — sync again shortly.`
        : "";
      Alert.alert(
        "Sync complete",
        imported
          ? `Imported ${imported} new page${imported === 1 ? "" : "s"}.${stillGoing}`
          : processing
            ? `Nothing ready yet.${stillGoing}`
            : available
              ? "Already up to date — every bridge page is on your phone."
              : "No pages found on the bridge for this book yet.",
      );
    } catch (e) {
      setScan(null);
      Alert.alert("Sync failed", e instanceof Error ? e.message : "Couldn't sync from the bridge.");
    }
  }

  function promptSettings(title: string, message: string) {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => router.push("/settings") },
    ]);
  }

  // Entry point for the Scan button: resolve the source, choose a capture
  // method, capture, then process.
  async function onScanPress() {
    const cfg = await resolveConfig();
    if (!cfg) return;

    const start = async (source: CaptureSource) => {
      try {
        const asset = await captureImage(source);
        if (!asset) return; // user cancelled
        if (cfg.source === "bridge") {
          setPagePrompt({ asset, cfg }); // ask which book page this is first
        } else {
          await runPipeline({ asset, cfg });
        }
      } catch (e) {
        setScan({
          k: "error",
          message: e instanceof Error ? e.message : "Capture failed.",
        });
      }
    };

    Alert.alert("Add a page", "Capture the page you're reading.", [
      { text: "Take photo", onPress: () => start("camera") },
      { text: "Choose from library", onPress: () => start("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="" onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  // Map declared chapters to whether any pages are built, and the first page index.
  const chapters = (book.meta.chapters ?? []).map((ch) => {
    const firstIdx = book.pages.findIndex((p) => p.chapter === ch.number);
    const count = book.pages.filter((p) => p.chapter === ch.number).length;
    return { ...ch, firstIdx, count, available: firstIdx !== -1 };
  });

  const open = (pageIdx: number) =>
    router.push({ pathname: "/reader/[id]", params: { id: book.id, start: String(pageIdx) } });
  // Resume: no `start` → reader falls back to the saved last page.
  const resume = () => router.push({ pathname: "/reader/[id]", params: { id: book.id } });

  const isComplete = (book.meta.status ?? "open") === "complete";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header
        title=""
        onBack={() => router.back()}
        onEdit={() => router.push(`/edit/${book.id}`)}
      />
      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        <Text style={styles.kicker}>{book.meta.author}</Text>
        <Text style={styles.title}>{book.meta.title}</Text>

        <View style={styles.statusRow}>
          <Feather
            name={isComplete ? "check-circle" : "edit-3"}
            size={14}
            color={isComplete ? colors.good : colors.inkSoft}
          />
          <Text style={[styles.statusText, isComplete && { color: colors.good }]}>
            {isComplete ? "Complete" : "Open · adding pages"}
          </Text>
        </View>

        <Pressable style={styles.scanBtn} onPress={onScanPress}>
          <Feather name="camera" size={18} color={colors.paper} />
          <Text style={styles.scanText}>Scan a page</Text>
        </Pressable>

        <Pressable style={styles.syncBtn} onPress={onSyncPress}>
          <Feather name="refresh-cw" size={16} color={colors.accent} />
          <Text style={styles.syncText}>Sync from bridge</Text>
        </Pressable>

        <Pressable style={styles.wordlistBtn} onPress={() => router.push(`/wordlist/${book.id}`)}>
          <Feather name="bookmark" size={16} color={colors.accent} />
          <Text style={styles.syncText}>
            Word list{wordCount > 0 ? ` (${wordCount})` : ""}
          </Text>
        </Pressable>

        {book.pages.length > 0 ? (
          <>
            <Pressable style={styles.beginBtn} onPress={resume}>
              <Text style={styles.beginText}>Begin reading</Text>
              <Feather name="arrow-right" size={18} color={colors.accent} />
            </Pressable>
            <Pressable style={styles.contentsBtn} onPress={() => router.push(`/contents/${book.id}`)}>
              <Feather name="list" size={16} color={colors.inkSoft} />
              <Text style={styles.contentsText}>Contents</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.empty}>
            No pages yet. Scan a page to start building this book.
          </Text>
        )}

        {chapters.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Chapters</Text>
            {chapters.map((ch) => (
              <Pressable
                key={ch.number}
                disabled={!ch.available}
                onPress={() => ch.available && open(ch.firstIdx)}
                style={[styles.chapterRow, !ch.available && { opacity: 0.4 }]}
              >
                <Text style={styles.chapterNum}>{ch.number}</Text>
                <Text style={styles.chapterTitle} numberOfLines={2}>
                  {ch.title}
                </Text>
                <Text style={styles.chapterCount}>
                  {ch.available ? `${ch.count}p` : "soon"}
                </Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <ScanOverlay
        phase={scan}
        onCancel={() => setScan(null)}
        onRetry={() => pending.current && runPipeline(pending.current)}
        onScanAnother={() => {
          setScan(null);
          onScanPress();
        }}
        onRead={(pageIdx) => {
          setScan(null);
          open(pageIdx);
        }}
      />

      <NumberPrompt
        visible={!!pagePrompt}
        title="Which book page is this?"
        message="Label the scan with its actual page number in the book."
        initial={book.pages.reduce((m, p) => Math.max(m, p.page), 0) + 1}
        confirmLabel="Scan"
        onCancel={() => setPagePrompt(null)}
        onConfirm={(page) => {
          const p = pagePrompt;
          setPagePrompt(null);
          if (p) runPipeline({ ...p, page });
        }}
      />
    </SafeAreaView>
  );
}

function Header({
  title,
  onBack,
  onEdit,
}: {
  title: string;
  onBack: () => void;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10}>
        <Feather name="chevron-left" size={26} color={colors.ink} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      {onEdit ? (
        <Pressable onPress={onEdit} hitSlop={10}>
          <Feather name="edit-2" size={20} color={colors.inkSoft} />
        </Pressable>
      ) : (
        <View style={{ width: 26 }} />
      )}
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
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  kicker: {
    fontFamily: fonts.ui,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.accent,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
    marginTop: spacing(1),
    marginBottom: spacing(3),
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    marginBottom: spacing(5),
  },
  statusText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  contentsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(3),
    marginTop: spacing(3),
  },
  contentsText: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing(3.5),
  },
  scanText: { fontFamily: fonts.ui, fontSize: 16, color: colors.paper },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(3),
    marginTop: spacing(3),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  syncText: { fontFamily: fonts.ui, fontSize: 15, color: colors.accent },
  wordlistBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(3),
    marginTop: spacing(3),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  beginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    paddingVertical: spacing(3.5),
    marginTop: spacing(3),
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  beginText: { fontFamily: fonts.ui, fontSize: 16, color: colors.accent },
  empty: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 15,
    color: colors.inkSoft,
    marginTop: spacing(4),
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.accent,
    marginTop: spacing(8),
    marginBottom: spacing(3),
  },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    paddingVertical: spacing(3),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  chapterNum: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.accent,
    width: 26,
  },
  chapterTitle: { fontFamily: fonts.body, fontSize: 16, color: colors.ink, flex: 1 },
  chapterCount: { fontFamily: fonts.ui, fontSize: 13, color: colors.inkSoft },
});
