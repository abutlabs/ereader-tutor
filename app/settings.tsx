// Settings — choose where translations come from (paid API key, or a local
// Claude Code bridge powered by your Max plan), the model, and manage the key.
// The key is stored in the device keystore and only ever sent to api.anthropic.com.

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  clearApiKey,
  DEFAULT_MODEL,
  DEFAULT_SOURCE,
  getApiKey,
  getBridgeUrl,
  getModel,
  getSource,
  ModelChoice,
  setApiKey,
  setBridgeUrl,
  setModel,
  setSource,
  TranslationSource,
} from "../src/storage/apiKey";
import { ClaudeError, pingApiKey, pingBridge } from "../src/api/claude";
import { colors, fonts, radius, spacing } from "../src/theme/theme";

type TestState = { kind: "idle" | "testing" | "ok" | "error"; msg?: string };

const MODELS: { id: ModelChoice; label: string; cost: string }[] = [
  { id: "claude-opus-4-8", label: "Opus 4.8 — best quality", cost: "API ~$0.05–0.12 / page" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6 — ~half the cost", cost: "API ~$0.03–0.06 / page" },
];

const SOURCES: { id: TranslationSource; label: string; sub: string }[] = [
  { id: "bridge", label: "Local Claude Code (Max)", sub: "Free via your laptop. No API key." },
  { id: "api", label: "Anthropic API key", sub: "Pay-as-you-go. Works anywhere." },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [source, setSourceState] = useState<TranslationSource>(DEFAULT_SOURCE);
  const [key, setKey] = useState("");
  const [hasStored, setHasStored] = useState(false);
  const [model, setModelState] = useState<ModelChoice>(DEFAULT_MODEL);
  const [test, setTest] = useState<TestState>({ kind: "idle" });
  const [bridge, setBridge] = useState("");
  const [bridgeTest, setBridgeTest] = useState<TestState>({ kind: "idle" });

  useEffect(() => {
    getApiKey().then((k) => setHasStored(!!k));
    getModel().then(setModelState);
    getSource().then(setSourceState);
    getBridgeUrl().then(setBridge);
  }, []);

  async function onPickSource(s: TranslationSource) {
    setSourceState(s);
    await setSource(s);
  }

  async function onSaveBridge() {
    const trimmed = bridge.trim();
    if (!trimmed) return;
    setBridgeTest({ kind: "testing" });
    try {
      await setBridgeUrl(trimmed);
      const saved = await getBridgeUrl();
      setBridge(saved);
      await pingBridge(saved);
      setBridgeTest({ kind: "ok", msg: "Bridge reachable. You're ready to scan." });
    } catch (e) {
      setBridgeTest({
        kind: "error",
        msg:
          e instanceof Error
            ? `Couldn't reach the bridge. Is "node bridge/server.mjs" running on the same Wi-Fi? (${e.message})`
            : "Couldn't reach the bridge.",
      });
    }
  }

  async function onSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    setTest({ kind: "testing" });
    try {
      await setApiKey(trimmed);
      await pingApiKey(trimmed, model);
      setHasStored(true);
      setKey("");
      setTest({ kind: "ok", msg: "Key saved and verified." });
    } catch (e) {
      const msg =
        e instanceof ClaudeError
          ? e.status === 401
            ? "That key was rejected (401). Check it and try again."
            : e.message
          : "Couldn't reach Anthropic. Check your connection.";
      setTest({ kind: "error", msg });
    }
  }

  async function onClear() {
    await clearApiKey();
    setHasStored(false);
    setTest({ kind: "idle" });
  }

  async function onPickModel(m: ModelChoice) {
    setModelState(m);
    await setModel(m);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.h1}>Settings</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(5) }}>
        <Text style={styles.sectionLabel}>Translation source</Text>
        <Text style={styles.help}>
          Where scanned pages get turned into lessons.
        </Text>
        {SOURCES.map((s) => (
          <Pressable
            key={s.id}
            style={[styles.modelRow, source === s.id && styles.modelRowOn]}
            onPress={() => onPickSource(s.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.modelLabel}>{s.label}</Text>
              <Text style={styles.modelCost}>{s.sub}</Text>
            </View>
            <Feather
              name={source === s.id ? "check-circle" : "circle"}
              size={20}
              color={source === s.id ? colors.accent : colors.rule}
            />
          </Pressable>
        ))}

        {source === "bridge" ? (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing(8) }]}>
              Bridge URL
            </Text>
            <Text style={styles.help}>
              On your laptop (signed into Claude Code), run{" "}
              <Text style={styles.code}>node bridge/server.mjs</Text> and paste the
              URL it prints. Phone and laptop must share Wi-Fi. Translations run on
              your Max plan — no API key, no per-page cost.
            </Text>
            <TextInput
              placeholder="http://192.168.x.x:8788"
              placeholderTextColor={colors.rule}
              value={bridge}
              onChangeText={setBridge}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.input}
            />
            <Pressable
              style={[styles.saveBtn, bridgeTest.kind === "testing" && { opacity: 0.6 }]}
              onPress={onSaveBridge}
              disabled={bridgeTest.kind === "testing"}
            >
              {bridgeTest.kind === "testing" ? (
                <ActivityIndicator color={colors.paper} />
              ) : (
                <Text style={styles.saveText}>Save & test connection</Text>
              )}
            </Pressable>
            {bridgeTest.kind === "ok" && (
              <Text style={[styles.result, { color: colors.good }]}>✓ {bridgeTest.msg}</Text>
            )}
            {bridgeTest.kind === "error" && (
              <Text style={[styles.result, { color: colors.accent }]}>{bridgeTest.msg}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { marginTop: spacing(8) }]}>
              Anthropic API key
            </Text>
            <Text style={styles.help}>
              Stored only on this device, in the secure keystore. You pay your own
              usage. Get one at console.anthropic.com.
            </Text>

            {hasStored ? (
              <View style={styles.storedRow}>
                <Feather name="lock" size={16} color={colors.good} />
                <Text style={styles.storedText}>A key is stored on this device.</Text>
                <Pressable onPress={onClear} hitSlop={8}>
                  <Text style={styles.clearText}>Remove</Text>
                </Pressable>
              </View>
            ) : null}

            <TextInput
              placeholder="sk-ant-..."
              placeholderTextColor={colors.rule}
              value={key}
              onChangeText={setKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              style={[styles.saveBtn, test.kind === "testing" && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={test.kind === "testing"}
            >
              {test.kind === "testing" ? (
                <ActivityIndicator color={colors.paper} />
              ) : (
                <Text style={styles.saveText}>
                  {hasStored ? "Replace & test key" : "Save & test key"}
                </Text>
              )}
            </Pressable>

            {test.kind === "ok" && (
              <Text style={[styles.result, { color: colors.good }]}>✓ {test.msg}</Text>
            )}
            {test.kind === "error" && (
              <Text style={[styles.result, { color: colors.accent }]}>{test.msg}</Text>
            )}
          </>
        )}

        <Text style={[styles.sectionLabel, { marginTop: spacing(8) }]}>Model</Text>
        {MODELS.map((m) => (
          <Pressable
            key={m.id}
            style={[styles.modelRow, model === m.id && styles.modelRowOn]}
            onPress={() => onPickModel(m.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.modelLabel}>{m.label}</Text>
              <Text style={styles.modelCost}>{m.cost}</Text>
            </View>
            <Feather
              name={model === m.id ? "check-circle" : "circle"}
              size={20}
              color={model === m.id ? colors.accent : colors.rule}
            />
          </Pressable>
        ))}
      </ScrollView>
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
  h1: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  sectionLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: spacing(2),
  },
  help: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSoft,
    marginBottom: spacing(4),
  },
  code: {
    fontFamily: fonts.bodyMedium,
    color: colors.ink,
    backgroundColor: colors.paperSoft,
  },
  storedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(2),
    marginBottom: spacing(3),
  },
  storedText: { fontFamily: fonts.body, fontSize: 15, color: colors.inkSoft, flex: 1 },
  clearText: { fontFamily: fonts.ui, fontSize: 14, color: colors.accent },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing(3.5),
    alignItems: "center",
    marginTop: spacing(3),
  },
  saveText: { fontFamily: fonts.ui, fontSize: 16, color: colors.paper },
  result: { fontFamily: fonts.body, fontSize: 15, marginTop: spacing(3) },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paperSoft,
    borderRadius: radius.md,
    padding: spacing(4),
    marginBottom: spacing(2.5),
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  modelRowOn: { borderColor: colors.accent },
  modelLabel: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.ink },
  modelCost: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: spacing(1),
  },
});
