// Edit a book's configurable metadata: author and lifecycle status. Marking a
// book "complete" also asks the bridge (if configured) to build its index.html.

import { useEffect, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book, BookStatus } from "../../src/data/schema";
import { getBook, updateBookMeta } from "../../src/storage/books";
import { getBridgeUrl } from "../../src/storage/apiKey";
import { buildBridgeIndex } from "../../src/api/claude";
import {
  COMMON_TARGET_LANGUAGES,
  DEFAULT_TARGET_LANGUAGE,
  languageName,
} from "../../src/data/languages";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("open");
  const [targetLang, setTargetLang] = useState(DEFAULT_TARGET_LANGUAGE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBook(id).then((b) => {
      if (!b) return;
      setBook(b);
      setAuthor(b.meta.author);
      setStatus(b.meta.status ?? "open");
      setTargetLang(b.meta.targetLanguage ?? DEFAULT_TARGET_LANGUAGE);
    });
  }, [id]);

  async function onSave() {
    if (!book || saving) return;
    setSaving(true);
    await updateBookMeta(book.id, {
      author: author.trim() || "Unknown",
      status,
      targetLanguage: targetLang.trim() || DEFAULT_TARGET_LANGUAGE,
    });

    // Marking complete builds the laptop-side index.html (best-effort).
    let indexNote = "";
    if (status === "complete") {
      const bridgeUrl = await getBridgeUrl();
      if (bridgeUrl) {
        try {
          const pages = await buildBridgeIndex(bridgeUrl, book.meta.title);
          indexNote = `\n\nBuilt index.html (${pages} page${pages === 1 ? "" : "s"}) on the laptop.`;
        } catch {
          indexNote = "\n\nCouldn't reach the bridge to build index.html — open the book and try Sync, then re-save.";
        }
      }
    }
    setSaving(false);
    Alert.alert("Saved", `Details updated.${indexNote}`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit details</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.readonly}>{book?.meta.title ?? "…"}</Text>

        <Text style={styles.label}>Author</Text>
        <TextInput
          value={author}
          onChangeText={setAuthor}
          placeholder="Author"
          placeholderTextColor={colors.rule}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: spacing(6) }]}>
          Lesson language ({languageName(book?.meta.language)} → ?)
        </Text>
        <Text style={styles.help}>
          Translations and notes are written in this language — your own.
        </Text>
        <TextInput
          value={targetLang}
          onChangeText={setTargetLang}
          placeholder="e.g. English"
          placeholderTextColor={colors.rule}
          style={styles.input}
        />
        <View style={styles.chips}>
          {COMMON_TARGET_LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => setTargetLang(lang)}
              style={[styles.chip, targetLang === lang && styles.chipOn]}
            >
              <Text style={[styles.chipText, targetLang === lang && styles.chipTextOn]}>{lang}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: spacing(6) }]}>Status</Text>
        <View style={styles.segment}>
          <StatusOption
            label="Open"
            sub="Still scanning pages"
            active={status === "open"}
            onPress={() => setStatus("open")}
          />
          <StatusOption
            label="Complete"
            sub="All pages in — build index"
            active={status === "complete"}
            onPress={() => setStatus("complete")}
          />
        </View>

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? "Saving…" : "Save"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusOption({
  label,
  sub,
  active,
  onPress,
}: {
  label: string;
  sub: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.option, active && styles.optionActive]} onPress={onPress}>
      <View style={styles.optionHead}>
        <Feather
          name={active ? "check-circle" : "circle"}
          size={18}
          color={active ? colors.good : colors.rule}
        />
        <Text style={[styles.optionLabel, active && { color: colors.ink }]}>{label}</Text>
      </View>
      <Text style={styles.optionSub}>{sub}</Text>
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
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  label: {
    fontFamily: fonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: spacing(2),
    marginTop: spacing(3),
  },
  readonly: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  help: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft, marginBottom: spacing(2) },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2), marginTop: spacing(3) },
  chip: {
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.ui, fontSize: 13, color: colors.inkSoft },
  chipTextOn: { color: colors.paper },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingVertical: spacing(2),
  },
  segment: { flexDirection: "row", gap: spacing(3) },
  option: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.rule,
    padding: spacing(4),
    gap: spacing(1),
  },
  optionActive: { borderColor: colors.good, backgroundColor: colors.paperSoft },
  optionHead: { flexDirection: "row", alignItems: "center", gap: spacing(2) },
  optionLabel: { fontFamily: fonts.ui, fontSize: 16, color: colors.inkSoft },
  optionSub: { fontFamily: fonts.body, fontSize: 13, color: colors.inkSoft },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing(3.5),
    alignItems: "center",
    marginTop: spacing(8),
  },
  saveText: { fontFamily: fonts.ui, fontSize: 16, color: colors.paper },
});
