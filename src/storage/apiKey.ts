// The Anthropic API key lives in the device keystore (expo-secure-store), never
// in plain storage. Model preference is a non-secret, kept in AsyncStorage.

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_SLOT = "anthropic_api_key";
const MODEL_SLOT = "anthropic_model";
const SOURCE_SLOT = "translation_source";
const BRIDGE_SLOT = "bridge_url";

export type ModelChoice = "claude-opus-4-8" | "claude-sonnet-4-6";
// Sonnet is the default: for scan + translate it's much faster than Opus with
// no meaningful quality loss at A2. Pick Opus in Settings for hard pages.
export const DEFAULT_MODEL: ModelChoice = "claude-sonnet-4-6";

// Where translations are produced: the paid API, or a local Claude Code bridge
// running on your laptop (powered by a Max subscription).
export type TranslationSource = "api" | "bridge";
export const DEFAULT_SOURCE: TranslationSource = "api";

export async function getApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY_SLOT);
  } catch {
    return null;
  }
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEY_SLOT, key.trim());
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_SLOT);
}

export async function hasApiKey(): Promise<boolean> {
  return !!(await getApiKey());
}

export async function getModel(): Promise<ModelChoice> {
  const v = (await AsyncStorage.getItem(MODEL_SLOT)) as ModelChoice | null;
  return v ?? DEFAULT_MODEL;
}

export async function setModel(model: ModelChoice): Promise<void> {
  await AsyncStorage.setItem(MODEL_SLOT, model);
}

export async function getSource(): Promise<TranslationSource> {
  const v = (await AsyncStorage.getItem(SOURCE_SLOT)) as TranslationSource | null;
  return v ?? DEFAULT_SOURCE;
}

export async function setSource(source: TranslationSource): Promise<void> {
  await AsyncStorage.setItem(SOURCE_SLOT, source);
}

// Normalize a pasted bridge URL: trim, add http:// if missing, drop trailing slash.
export function normalizeBridgeUrl(raw: string): string {
  let u = raw.trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "http://" + u;
  return u.replace(/\/+$/, "");
}

export async function getBridgeUrl(): Promise<string> {
  return (await AsyncStorage.getItem(BRIDGE_SLOT)) ?? "";
}

export async function setBridgeUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(BRIDGE_SLOT, normalizeBridgeUrl(url));
}
