// The Anthropic API key lives in the device keystore (expo-secure-store), never
// in plain storage. Model preference is a non-secret, kept in AsyncStorage.

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_SLOT = "anthropic_api_key";
const MODEL_SLOT = "anthropic_model";

export type ModelChoice = "claude-opus-4-8" | "claude-sonnet-4-6";
export const DEFAULT_MODEL: ModelChoice = "claude-opus-4-8";

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
