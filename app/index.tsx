// Projects home — the list of books you're learning from. Tap one to open it;
// create a new (empty) project that scanning will fill in a later phase.

import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import type { BookSummary } from "../src/data/schema";
import { createBook, deleteBook, listBooks } from "../src/storage/books";
import { colors, fonts, radius, spacing } from "../src/theme/theme";

export default function ProjectsScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const refresh = useCallback(() => {
    listBooks().then(setBooks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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
    refresh();
    router.push(`/book/${book.id}`);
  }

  function onLongPress(book: BookSummary) {
    if (book.id === "dik-trom") return;
    Alert.alert("Delete project?", `"${book.title}" and its scans.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteBook(book.id);
          refresh();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>EReader Tutor</Text>
          <Text style={styles.h1}>Your projects</Text>
        </View>
        <Pressable onPress={() => router.push("/settings")} hitSlop={10}>
          <Feather name="settings" size={22} color={colors.inkSoft} />
        </Pressable>
      </View>

      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing(5), paddingTop: 0 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/book/${item.id}`)}
            onLongPress={() => onLongPress(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.author} · {item.pageCount}{" "}
                {item.pageCount === 1 ? "page" : "pages"}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.rule} />
          </Pressable>
        )}
        ListFooterComponent={
          creating ? (
            <View style={styles.createBox}>
              <TextInput
                placeholder="Book title (e.g. Dik Trom)"
                placeholderTextColor={colors.rule}
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                autoFocus
              />
              <TextInput
                placeholder="Author (optional)"
                placeholderTextColor={colors.rule}
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
            <Pressable style={styles.newBtn} onPress={() => setCreating(true)}>
              <Feather name="plus" size={20} color={colors.accent} />
              <Text style={styles.newBtnText}>New project</Text>
            </Pressable>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: spacing(5),
  },
  kicker: {
    fontFamily: fonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: spacing(1),
  },
  h1: { fontFamily: fonts.displayBold, fontSize: 30, color: colors.ink },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paperSoft,
    borderRadius: radius.md,
    padding: spacing(5),
    marginBottom: spacing(3),
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.ink },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: spacing(1),
  },
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
  newBtnText: { fontFamily: fonts.ui, fontSize: 16, color: colors.accent },
  createBox: {
    backgroundColor: colors.paperSoft,
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
  createActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing(5),
    marginTop: spacing(1),
  },
  cancelText: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
  createBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(6),
    borderRadius: radius.pill,
  },
  createBtnText: { fontFamily: fonts.ui, fontSize: 15, color: colors.paper },
});
