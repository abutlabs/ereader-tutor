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
  TranslateConfig,
} from "../../src/capture/scan";
import ScanOverlay, { ScanPhase } from "../../src/components/ScanOverlay";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

interface Pending {
  asset: { uri: string; width?: number; height?: number };
  cfg: TranslateConfig;
}

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [scan, setScan] = useState<ScanPhase | null>(null);
  const pending = useRef<Pending | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (id) getBook(id).then(setBook);
    }, [id]),
  );

  // Run the capture → Claude → append pipeline for an already-captured asset.
  async function runPipeline(p: Pending) {
    if (!book) return;
    pending.current = p;
    setScan({ k: "working", label: "Preparing the image…" });
    try {
      const { book: updated, pageIdx } = await processScan(
        book.id,
        p.asset,
        p.cfg,
        (label) => setScan({ k: "working", label }),
      );
      setBook(updated);
      setScan({ k: "done", pageIdx });
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
        await runPipeline({ asset, cfg });
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Header title="" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        <Text style={styles.kicker}>{book.meta.author}</Text>
        <Text style={styles.title}>{book.meta.title}</Text>

        <Pressable style={styles.scanBtn} onPress={onScanPress}>
          <Feather name="camera" size={18} color={colors.paper} />
          <Text style={styles.scanText}>Scan a page</Text>
        </Pressable>

        {book.pages.length > 0 ? (
          <Pressable style={styles.beginBtn} onPress={resume}>
            <Text style={styles.beginText}>Begin reading</Text>
            <Feather name="arrow-right" size={18} color={colors.accent} />
          </Pressable>
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
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10}>
        <Feather name="chevron-left" size={26} color={colors.ink} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 26 }} />
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
    marginBottom: spacing(5),
  },
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
