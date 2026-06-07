// The tap-to-translate sheet: Dutch (with audio), English, word-by-word (each
// tappable for audio), A2 grammar notes, slow-mode toggle, and mark-as-learned.

import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Sentence } from "../data/schema";
import { normWord } from "../storage/wordlist";
import { colors, fonts, radius, spacing } from "../theme/theme";

interface Props {
  sentence: Sentence | null;
  language: string;
  learned: boolean;
  slow: boolean;
  speakingId: string | null;
  savedWords: Set<string>; // normalised keys of words saved to the study list
  onSpeak: (text: string, id: string) => void;
  onToggleSlow: () => void;
  onToggleLearned: () => void;
  onToggleWord: (word: { nl: string; en: string }) => void;
  onClose: () => void;
}

export default function SentenceSheet({
  sentence,
  language,
  learned,
  slow,
  speakingId,
  savedWords,
  onSpeak,
  onToggleSlow,
  onToggleLearned,
  onToggleWord,
  onClose,
}: Props) {
  const visible = !!sentence;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {sentence && (
          <>
            <View style={styles.topRow}>
              <Pressable
                onPress={onToggleSlow}
                style={[styles.slowToggle, slow && styles.slowToggleOn]}
                hitSlop={8}
              >
                <Feather
                  name="clock"
                  size={14}
                  color={slow ? colors.paper : colors.inkSoft}
                />
                <Text style={[styles.slowText, slow && styles.slowTextOn]}>
                  Slow
                </Text>
              </Pressable>
              <Pressable onPress={onClose} hitSlop={10}>
                <Feather name="x" size={22} color={colors.inkSoft} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing(8) }}
            >
              {/* Dutch + speak */}
              <Pressable
                style={styles.dutchRow}
                onPress={() => onSpeak(sentence.dutch, "sentence")}
              >
                <Text style={styles.dutch}>{sentence.dutch}</Text>
                <View
                  style={[
                    styles.speakBtn,
                    speakingId === "sentence" && styles.speakBtnActive,
                  ]}
                >
                  <Feather
                    name={speakingId === "sentence" ? "square" : "volume-2"}
                    size={18}
                    color={
                      speakingId === "sentence" ? colors.paper : colors.accent
                    }
                  />
                </View>
              </Pressable>

              <Text style={styles.english}>{sentence.english}</Text>

              {/* Word by word */}
              {sentence.words.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Word by word — tap to hear, bookmark to save</Text>
                  <View style={styles.wordList}>
                    {sentence.words.map((w, i) => {
                      const id = `word-${i}`;
                      const playing = speakingId === id;
                      const saved = savedWords.has(normWord(w.nl));
                      return (
                        <View
                          key={id}
                          style={[styles.wordRow, playing && styles.wordRowActive]}
                        >
                          <Pressable style={styles.wordTap} onPress={() => onSpeak(w.nl, id)}>
                            <Text style={styles.wordNl}>{w.nl}</Text>
                            <Text style={styles.wordEn}>{w.en}</Text>
                            <Feather
                              name="volume-2"
                              size={14}
                              color={playing ? colors.accent : colors.rule}
                            />
                          </Pressable>
                          <Pressable
                            hitSlop={8}
                            style={styles.bookmarkBtn}
                            onPress={() => onToggleWord({ nl: w.nl, en: w.en })}
                          >
                            <Feather
                              name="bookmark"
                              size={18}
                              color={saved ? colors.accent : colors.rule}
                            />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Grammar notes */}
              {sentence.notes.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Grammar notes</Text>
                  {sentence.notes.map((n, i) => (
                    <View key={i} style={styles.note}>
                      <Text style={styles.noteTitle}>{n.title}</Text>
                      <Text style={styles.noteBody}>{n.body}</Text>
                    </View>
                  ))}
                </>
              )}

              {/* Mark learned */}
              <Pressable
                onPress={onToggleLearned}
                style={[styles.learnBtn, learned && styles.learnBtnOn]}
              >
                <Feather
                  name="check"
                  size={18}
                  color={learned ? colors.paper : colors.good}
                />
                <Text style={[styles.learnText, learned && styles.learnTextOn]}>
                  {learned ? "Marked as learned" : "Mark as learned"}
                </Text>
              </Pressable>
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing(6),
    paddingTop: spacing(3),
    maxHeight: "82%",
  },
  grabber: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.rule,
    marginBottom: spacing(3),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(3),
  },
  slowToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1.5),
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.rule,
  },
  slowToggleOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  slowText: { fontFamily: fonts.ui, fontSize: 13, color: colors.inkSoft },
  slowTextOn: { color: colors.paper },
  dutchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(3),
    marginBottom: spacing(2),
  },
  dutch: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 23,
    lineHeight: 32,
    color: colors.ink,
  },
  speakBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  speakBtnActive: { backgroundColor: colors.accent },
  english: {
    fontFamily: fonts.bodyItalic,
    fontStyle: "italic",
    fontSize: 17,
    lineHeight: 26,
    color: colors.inkSoft,
    marginBottom: spacing(5),
  },
  sectionLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: spacing(2),
    marginTop: spacing(2),
  },
  wordList: { gap: 1, marginBottom: spacing(3) },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  wordTap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    paddingVertical: spacing(2.5),
  },
  bookmarkBtn: { paddingVertical: spacing(2.5), paddingLeft: spacing(3) },
  wordRowActive: { backgroundColor: colors.accentSoft },
  wordNl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ink,
    width: "42%",
  },
  wordEn: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft, flex: 1 },
  note: {
    backgroundColor: colors.paperSoft,
    borderRadius: radius.md,
    padding: spacing(4),
    marginBottom: spacing(2.5),
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  noteTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing(1),
  },
  noteBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  learnBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(2),
    marginTop: spacing(4),
    paddingVertical: spacing(3.5),
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.good,
  },
  learnBtnOn: { backgroundColor: colors.good, borderColor: colors.good },
  learnText: { fontFamily: fonts.ui, fontSize: 16, color: colors.good },
  learnTextOn: { color: colors.paper },
});
