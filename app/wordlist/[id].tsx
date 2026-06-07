// The book's saved word/phrase study list. Tap an item to hear it; remove ones
// you've genuinely got. Built up by bookmarking words in the reader's sheet.

import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { Book } from "../../src/data/schema";
import { getBook } from "../../src/storage/books";
import { loadWordlist, removeWord, type SavedWord } from "../../src/storage/wordlist";
import { onSpeakingChange, speak, stop } from "../../src/audio/speech";
import { colors, fonts, radius, spacing } from "../../src/theme/theme";

export default function WordlistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [items, setItems] = useState<SavedWord[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => onSpeakingChange(setSpeakingId), []);
  useEffect(() => () => stop(), []);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getBook(id).then(setBook);
      loadWordlist(id).then(setItems);
    }, [id]),
  );

  const lang = book?.meta.language ?? "nl-NL";

  async function onRemove(nl: string) {
    setItems(await removeWord(id!, nl));
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Word list</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.nl}
        contentContainerStyle={{ padding: spacing(5), paddingTop: spacing(2) }}
        ListHeaderComponent={
          items.length ? (
            <Text style={styles.summary}>
              {items.length} saved {items.length === 1 ? "phrase" : "phrases"} · tap to hear
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bookmark" size={28} color={colors.rule} />
            <Text style={styles.emptyText}>
              No saved phrases yet. In the reader, tap a sentence, then bookmark any
              word or phrase you want to come back to.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const sid = `wl-${item.nl}`;
          const playing = speakingId === sid;
          return (
            <View style={[styles.row, playing && styles.rowActive]}>
              <Pressable
                style={styles.tap}
                onPress={() => speak(item.nl, sid, { language: lang })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.nl}>{item.nl}</Text>
                  <Text style={styles.en}>{item.en}</Text>
                </View>
                <Feather
                  name={playing ? "square" : "volume-2"}
                  size={18}
                  color={playing ? colors.accent : colors.rule}
                />
              </Pressable>
              <Pressable hitSlop={8} style={styles.removeBtn} onPress={() => onRemove(item.nl)}>
                <Feather name="x" size={18} color={colors.inkSoft} />
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
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
  summary: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: spacing(3),
  },
  empty: { alignItems: "center", gap: spacing(3), marginTop: spacing(16), paddingHorizontal: spacing(6) },
  emptyText: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    marginBottom: spacing(2),
    backgroundColor: colors.paperSoft,
    paddingRight: spacing(2),
  },
  rowActive: { backgroundColor: colors.accentSoft },
  tap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    padding: spacing(4),
  },
  nl: { fontFamily: fonts.bodyMedium, fontSize: 17, color: colors.ink },
  en: { fontFamily: fonts.body, fontSize: 14, color: colors.inkSoft, marginTop: spacing(0.5) },
  removeBtn: { padding: spacing(3) },
});
