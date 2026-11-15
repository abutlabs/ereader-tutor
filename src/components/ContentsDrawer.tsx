// Contents drawer for full-screen reading: a side panel over the page listing
// the book's chapters (or its pages, when it has no chapters). Tap one to jump
// there without leaving full screen.

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { Book } from "../data/schema";
import { bookChapters } from "../data/chapters";
import { colors, fonts, motion, spacing } from "../theme/theme";
import { TOUCH, useLayout } from "../theme/layout";

interface Props {
  visible: boolean;
  book: Book;
  pageIdx: number;
  onJump: (pageIdx: number) => void;
  onFullContents: () => void;
  onExitFullScreen: () => void;
  onClose: () => void;
}

export default function ContentsDrawer({
  visible,
  book,
  pageIdx,
  onJump,
  onFullContents,
  onExitFullScreen,
  onClose,
}: Props) {
  const L = useLayout();
  const toc = bookChapters(book);
  const current = toc.chapterOf(pageIdx);
  const rows = toc.chapters.length
    ? toc.chapters
        .filter((c) => c.firstIdx !== -1)
        .map((c) => ({ key: `c${c.number}`, idx: c.firstIdx, label: c.title, meta: `p.${book.pages[c.firstIdx]?.page ?? ""}`, on: c.number === current }))
    : book.pages.map((p, i) => ({ key: `p${i}`, idx: i, label: p.title || `Page ${p.page}`, meta: `p.${p.page}`, on: i === pageIdx }));
  const width = Math.min(L.tablet ? 460 : 340, L.width * 0.86);
  const size = Math.round(16 * L.type);

  return (
    <Modal visible={visible} transparent animationType={motion("fade")} onRequestClose={onClose}>
      <View style={styles.root}>
        <SafeAreaView style={[styles.panel, { width }]} edges={["top", "bottom", "left"]}>
          <View style={styles.head}>
            <Text style={[styles.title, { fontSize: Math.round(18 * L.type) }]} numberOfLines={2}>
              {book.meta.title}
            </Text>
            <Pressable onPress={onClose} style={styles.iconBtn} accessibilityLabel="Close contents">
              <Feather name="x" size={22} color={colors.ink} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }}>
            {rows.map((r) => (
              <Pressable
                key={r.key}
                style={[styles.row, r.on && styles.rowOn]}
                onPress={() => {
                  onJump(r.idx);
                  onClose();
                }}
              >
                <Text style={[styles.rowLabel, { fontSize: size }, r.on && styles.rowLabelOn]} numberOfLines={2}>
                  {r.label}
                </Text>
                <Text style={styles.rowMeta}>{r.meta}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.foot}>
            <Pressable
              style={styles.footBtn}
              onPress={() => {
                onClose();
                onFullContents();
              }}
            >
              <Feather name="list" size={18} color={colors.inkSoft} />
              <Text style={styles.footText}>All pages</Text>
            </Pressable>
            <Pressable
              style={styles.footBtn}
              onPress={() => {
                onClose();
                onExitFullScreen();
              }}
            >
              <Feather name="minimize-2" size={18} color={colors.inkSoft} />
              <Text style={styles.footText}>Exit full screen</Text>
            </Pressable>
          </View>
        </SafeAreaView>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close contents" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  panel: {
    backgroundColor: colors.paper,
    borderRightWidth: 1,
    borderRightColor: colors.rule,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: spacing(5),
    paddingRight: spacing(1),
    paddingVertical: spacing(2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  title: { flex: 1, fontFamily: fonts.display, color: colors.ink },
  iconBtn: { minWidth: TOUCH, minHeight: TOUCH, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    minHeight: TOUCH + 4,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(2.5),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ruleSoft,
  },
  rowOn: { borderLeftWidth: 4, borderLeftColor: colors.accent, paddingLeft: spacing(5) - 4 },
  rowLabel: { flex: 1, fontFamily: fonts.body, color: colors.ink },
  rowLabelOn: { fontFamily: fonts.bodyMedium },
  rowMeta: { fontFamily: fonts.ui, fontSize: 12, color: colors.inkFaint },
  foot: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.rule,
    paddingVertical: spacing(1),
  },
  footBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    minHeight: TOUCH,
    paddingHorizontal: spacing(5),
  },
  footText: { fontFamily: fonts.ui, fontSize: 15, color: colors.inkSoft },
});
