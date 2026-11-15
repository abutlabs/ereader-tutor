// Floating pen-notes toolbar for the reader. Collapsed it is one ✎ button
// (plus undo when there is something to undo); open it for the eraser, finger
// writing, clear page and the Notes screen. The stylus writes either way.

import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Ink } from "./ink";
import { colors, fonts, spacing } from "../theme/theme";
import { TOUCH } from "../theme/layout";

export default function InkTools({ ink, onNotes }: { ink: Ink; onNotes: () => void }) {
  const [open, setOpen] = useState(false);
  const erasing = ink.mode === "erase";

  const Btn = ({
    icon,
    label,
    on,
    disabled,
    onPress,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    on?: boolean;
    disabled?: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ selected: !!on, disabled: !!disabled }}
      style={[styles.btn, on && styles.btnOn, disabled && { opacity: 0.35 }]}
    >
      <Feather name={icon} size={20} color={on ? colors.paper : colors.ink} />
    </Pressable>
  );

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {open ? (
        <View style={styles.bar}>
          <Btn icon="corner-up-left" label="Undo" disabled={!ink.canUndo} onPress={ink.undo} />
          <Btn
            icon="delete"
            label={erasing ? "Eraser on" : "Eraser"}
            on={erasing}
            onPress={() => ink.setMode(erasing ? "pen" : "erase")}
          />
          <Btn
            icon="pen-tool"
            label={ink.fingerWrite ? "Finger writing on — scrolling off" : "Write with finger"}
            on={ink.fingerWrite}
            onPress={() => ink.setFingerWrite(!ink.fingerWrite)}
          />
          <Btn
            icon="trash-2"
            label="Clear this page's notes"
            disabled={!ink.strokes.length}
            onPress={() =>
              Alert.alert("Clear this page?", "Removes your pen notes on this page. You can undo it.", [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: ink.clearPage },
              ])
            }
          />
          <Btn icon="book-open" label="All notes" onPress={onNotes} />
          <Btn icon="chevron-right" label="Close pen tools" onPress={() => setOpen(false)} />
        </View>
      ) : (
        <View style={styles.bar}>
          {ink.canUndo ? <Btn icon="corner-up-left" label="Undo" onPress={ink.undo} /> : null}
          <Btn
            icon={erasing ? "delete" : "edit-3"}
            label="Pen tools"
            on={erasing || ink.fingerWrite}
            onPress={() => setOpen(true)}
          />
        </View>
      )}
      {erasing || ink.fingerWrite ? (
        <Text style={styles.hint}>
          {erasing ? "Eraser — rub out strokes" : "Finger writes · scrolling off"}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: spacing(2), bottom: spacing(2), alignItems: "flex-end" },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: TOUCH,
    padding: 2,
    gap: 2,
  },
  btn: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOn: { backgroundColor: colors.ink },
  hint: {
    marginTop: spacing(1),
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.inkSoft,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing(2),
  },
});
