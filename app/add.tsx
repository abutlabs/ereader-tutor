// Add a book — Hearth. Pick a DRM-free EPUB ("direct text"), set independent
// reading + tutor languages and a CEFR level, and build lessons. Also detects
// Adobe `.acsm` loans (honest guidance, no DRM bypass) and Readium-LCP EPUBs.

import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import JSZip from "jszip";
import { parseEpub, type EpubDoc } from "../src/epub/parse";
import { parseAcsm, type AcsmInfo } from "../src/transfer/acsm";
import { appendPage, createBook } from "../src/storage/books";
import { getApiKey, getModel } from "../src/storage/apiKey";
import { textToLesson, lessonToParagraphs } from "../src/api/claude";
import { languageName } from "../src/data/languages";
import { colors, fonts, radius, spacing } from "../src/theme/theme";

const LANGS = [
  { name: "Dutch", code: "nl" },
  { name: "English", code: "en" },
  { name: "German", code: "de" },
  { name: "French", code: "fr" },
  { name: "Spanish", code: "es" },
  { name: "Italian", code: "it" },
  { name: "Japanese", code: "ja" },
];
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const CHAPTERS_PER_BUILD = 2; // bound cost; the rest can be added later

type Phase = "pick" | "epub" | "acsm" | "lcp" | "building" | "done";

export default function AddBookScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [busy, setBusy] = useState(false);

  const [epub, setEpub] = useState<EpubDoc | null>(null);
  const [acsm, setAcsm] = useState<AcsmInfo | null>(null);
  const [readingLang, setReadingLang] = useState("Dutch");
  const [tutorLang, setTutorLang] = useState("English");
  const [level, setLevel] = useState("A2");
  const [builtId, setBuiltId] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const sourceName = epub ? languageName(epub.language) : "";

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["application/epub+zip", "application/vnd.adobe.adept+xml", "*/*"],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    setBusy(true);
    try {
      if (/\.acsm$/i.test(a.name)) {
        setAcsm(await parseAcsm(a.uri, a.name));
        setPhase("acsm");
        return;
      }
      // EPUB — detect Readium-LCP / DRM before parsing.
      const zip = await JSZip.loadAsync(await FileSystem.readAsStringAsync(a.uri, { encoding: FileSystem.EncodingType.Base64 }), { base64: true });
      if (zip.file("META-INF/license.lcpl") || zip.file("META-INF/encryption.xml")) {
        setPhase("lcp");
        return;
      }
      const doc = await parseEpub(a.uri);
      setEpub(doc);
      setReadingLang(languageName(doc.language)); // default: read in the original
      setPhase("epub");
    } catch (e) {
      Alert.alert("Couldn't open that file", e instanceof Error ? e.message : "Unsupported file.");
    } finally {
      setBusy(false);
    }
  }

  async function build() {
    if (!epub) return;
    const apiKey = await getApiKey();
    if (!apiKey) {
      Alert.alert(
        "API key needed for EPUBs",
        "EPUB text is processed with your Anthropic API key (it isn't an image, so the Max bridge doesn't apply). Add a key in Settings.",
      );
      return;
    }
    setPhase("building");
    const model = await getModel();
    const code = LANGS.find((l) => l.name === readingLang)?.code || "nl";
    const book = await createBook({
      title: epub.title,
      author: epub.author,
      language: code, // reading/display language (drives TTS)
      readingLang,
      targetLanguage: tutorLang,
      level,
      origin: "epub",
      source: `EPUB · original ${sourceName}`,
    });
    const todo = epub.chapters.slice(0, CHAPTERS_PER_BUILD);
    for (let i = 0; i < todo.length; i++) {
      setProgress(`Building lessons… chapter ${i + 1}/${todo.length}`);
      const passage = todo[i].paragraphs.map((p) => p.join(" ")).join("\n\n").slice(0, 6000);
      try {
        const lesson = await textToLesson(passage, apiKey, model, {
          sourceLang: sourceName,
          readingLang,
          tutorLang,
          level,
        });
        await appendPage(book.id, { title: lesson.pageTitle ?? undefined, paragraphs: lessonToParagraphs(lesson) });
      } catch {
        /* skip a chapter that fails */
      }
    }
    setBuiltId(book.id);
    setPhase("done");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Add a book</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        {phase === "pick" && (
          <>
            <Pressable style={styles.pickBtn} onPress={pick} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <Feather name="book" size={20} color={colors.accent} />
                  <Text style={styles.pickText}>Choose an EPUB or library loan</Text>
                </>
              )}
            </Pressable>
            <View style={styles.legend}>
              <View style={styles.legendRow}>
                <View style={[styles.lane, { backgroundColor: colors.goodSoft }]}>
                  <Text style={[styles.laneText, { color: colors.good }]}>Direct text</Text>
                </View>
                <Text style={styles.legendDesc}>DRM-free EPUB / Readium-LCP — Hearth reads the real text.</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.lane, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.laneText, { color: colors.accentDeep }]}>Capture only</Text>
                </View>
                <Text style={styles.legendDesc}>Adobe-DRM (.acsm) loan — text is locked; photograph pages you're licensed to view.</Text>
              </View>
            </View>
          </>
        )}

        {phase === "epub" && epub && (
          <>
            <Text style={styles.bookTitle}>{epub.title}</Text>
            <Text style={styles.bookMeta}>
              {epub.author} · {epub.chapters.length} chapters · original {sourceName}
            </Text>

            <Text style={styles.label}>Read it in</Text>
            <LangChips value={readingLang} original={sourceName} onChange={setReadingLang} />
            <Text style={styles.note}>
              {readingLang === sourceName
                ? "You'll read the book in its original language."
                : `Claude translates the book into ${readingLang} as you read. The original ${sourceName} stays one tap away.`}
            </Text>

            <Text style={styles.label}>Explain it in</Text>
            <LangChips value={tutorLang} onChange={setTutorLang} />

            <Text style={styles.label}>Your level in {readingLang}</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((l) => (
                <Pressable key={l} style={[styles.level, level === l && styles.levelOn]} onPress={() => setLevel(l)}>
                  <Text style={[styles.levelText, level === l && { color: "#fff" }]}>{l}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.summary}>
              Read {readingLang} · tutoring in {tutorLang} · level {level}
            </Text>
            <Pressable style={styles.buildBtn} onPress={build}>
              <Text style={styles.buildText}>Build my lessons</Text>
            </Pressable>
            <Text style={styles.smallNote}>
              Builds the first {CHAPTERS_PER_BUILD} chapters to start — more can follow.
            </Text>
          </>
        )}

        {phase === "acsm" && acsm && <AcsmExplainer info={acsm} onEpub={() => setPhase("pick")} onCapture={() => router.back()} />}

        {phase === "lcp" && (
          <View style={styles.card}>
            <View style={[styles.lane, { backgroundColor: colors.goodSoft, alignSelf: "flex-start" }]}>
              <Text style={[styles.laneText, { color: colors.good }]}>Direct text · LCP</Text>
            </View>
            <Text style={[styles.bookTitle, { marginTop: spacing(3) }]}>Readium-LCP loan</Text>
            <Text style={styles.lcpBody}>
              This loan uses Readium LCP — an open DRM Hearth is licensed to read directly: your
              passphrase decrypts the real text on-device (no screenshots, no OCR).
            </Text>
            <Text style={styles.lcpNote}>
              Decryption needs the Readium-LCP module, a native library that isn't in Expo Go — it
              ships in a dev/production build. The flow (passphrase → license → plaintext → lessons)
              is wired to the same pipeline; this build detects LCP and stops here.
            </Text>
            <Pressable style={styles.ghost} onPress={() => setPhase("pick")}>
              <Text style={styles.ghostText}>Use a DRM-free EPUB instead</Text>
            </Pressable>
          </View>
        )}

        {phase === "building" && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.buildingText}>{progress || "Building lessons…"}</Text>
          </View>
        )}

        {phase === "done" && (
          <View style={styles.center}>
            <Feather name="check-circle" size={40} color={colors.good} />
            <Text style={styles.doneTitle}>Added to your library</Text>
            <Text style={styles.doneSub}>Reading in {readingLang}, tutored in {tutorLang}, level {level}.</Text>
            <Pressable style={styles.buildBtn} onPress={() => builtId && router.replace(`/book/${builtId}`)}>
              <Text style={styles.buildText}>Open the book</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LangChips({ value, original, onChange }: { value: string; original?: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chips}>
      {LANGS.map((l) => (
        <Pressable key={l.code} style={[styles.chip, value === l.name && styles.chipOn]} onPress={() => onChange(l.name)}>
          <Text style={[styles.chipText, value === l.name && { color: "#fff" }]}>{l.name}</Text>
          {original === l.name && <Text style={[styles.orig, value === l.name && { color: "#fff" }]}>Original</Text>}
        </Pressable>
      ))}
    </View>
  );
}

function AcsmExplainer({ info, onEpub, onCapture }: { info: AcsmInfo; onEpub: () => void; onCapture: () => void }) {
  return (
    <View>
      <Text style={styles.bookTitle}>{info.title || "Library loan"}</Text>
      <Text style={styles.bookMeta}>
        {[info.author, info.publisher, info.language].filter(Boolean).join(" · ")}
      </Text>

      <View style={styles.drmBanner}>
        <Feather name="lock" size={16} color={colors.accentDeep} />
        <Text style={styles.drmText}>
          This is an Adobe-DRM loan, not a book file. {info.fileName} is a download ticket
          {info.distributor ? ` from ${info.distributor}` : ""}
          {info.until ? `; display permission runs until ${info.until}.` : "."}
        </Text>
      </View>

      <Text style={styles.label}>Why not just read the text?</Text>
      <Text style={styles.note}>
        The book is encrypted and only Adobe's own reader holds the key — no app can read the
        unlocked text. (Readium-LCP loans are different; those Hearth reads directly.)
      </Text>

      <Text style={styles.label}>How to read your loan</Text>
      <Text style={styles.note}>
        Get a free Adobe ID → open the loan in Adobe Digital Editions or your library app → read it
        {info.until ? ` until ${info.until}` : ""}.
      </Text>

      <Text style={styles.label}>Two ways to still get tutoring</Text>
      <Pressable style={styles.ghost} onPress={onEpub}>
        <Feather name="book" size={17} color={colors.accent} />
        <Text style={styles.ghostText}>Use a DRM-free EPUB</Text>
      </Pressable>
      <Pressable style={styles.ghost} onPress={onCapture}>
        <Feather name="camera" size={17} color={colors.accent} />
        <Text style={styles.ghostText}>Capture pages you're licensed to view</Text>
      </Pressable>
      <Text style={styles.footerNote}>Parsed locally from your .acsm · nothing was uploaded.</Text>
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
  legend: { marginTop: spacing(5), gap: spacing(3) },
  legendRow: { flexDirection: "row", alignItems: "center", gap: spacing(3) },
  lane: { paddingVertical: spacing(1), paddingHorizontal: spacing(2.5), borderRadius: radius.pill },
  laneText: { fontFamily: fonts.uiSemibold, fontSize: 11.5 },
  legendDesc: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, lineHeight: 18 },

  bookTitle: { fontFamily: fonts.displayBold, fontSize: 23, color: colors.ink },
  bookMeta: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkSoft, marginTop: spacing(1) },
  label: {
    fontFamily: fonts.uiSemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginTop: spacing(6),
    marginBottom: spacing(2.5),
  },
  note: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.inkSoft, marginTop: spacing(2) },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2) },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3.5),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.ui, fontSize: 14, color: colors.inkSoft },
  orig: { fontFamily: fonts.uiSemibold, fontSize: 10, color: colors.accent },
  levelRow: { flexDirection: "row", gap: spacing(2) },
  level: {
    flex: 1,
    paddingVertical: spacing(2.5),
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
  },
  levelOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  levelText: { fontFamily: fonts.uiSemibold, fontSize: 14, color: colors.inkSoft },
  summary: {
    fontFamily: fonts.ui,
    fontSize: 13.5,
    color: colors.ink,
    backgroundColor: colors.cardDeep,
    borderRadius: radius.sm,
    padding: spacing(3),
    textAlign: "center",
    marginTop: spacing(6),
  },
  buildBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing(4), alignItems: "center", marginTop: spacing(4) },
  buildText: { fontFamily: fonts.uiSemibold, fontSize: 15.5, color: "#fff" },
  smallNote: { fontFamily: fonts.body, fontSize: 12.5, color: colors.inkFaint, textAlign: "center", marginTop: spacing(2) },

  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing(5) },
  lcpBody: { fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.inkSoft, marginTop: spacing(2) },
  lcpNote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.inkFaint, marginTop: spacing(3) },

  drmBanner: {
    flexDirection: "row",
    gap: spacing(2.5),
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing(4),
    marginTop: spacing(4),
  },
  drmText: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.ink },
  ghost: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ruleSoft,
    padding: spacing(3.5),
    marginTop: spacing(3),
  },
  ghostText: { fontFamily: fonts.uiSemibold, fontSize: 14.5, color: colors.accent },
  footerNote: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaint, textAlign: "center", marginTop: spacing(5) },

  center: { alignItems: "center", marginTop: spacing(16), gap: spacing(3) },
  buildingText: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft },
  doneTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.ink, marginTop: spacing(2) },
  doneSub: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, textAlign: "center" },
});
