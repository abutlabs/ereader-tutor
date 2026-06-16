// Which books the user owns. Free books are always owned; paid books are added
// here once purchased. Persisted in AsyncStorage. The billing layer (src/billing)
// calls unlock() on a successful purchase / restore; the rest of the app asks
// isUnlocked() to gate reading.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CATALOG } from "../data/catalog";

const KEY = "entitlements:owned"; // JSON string[] of purchased book ids

function freeIds(): string[] {
  return CATALOG.filter((c) => c.access === "free").map((c) => c.id);
}

async function purchasedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Every book the user can read right now: all free books + anything purchased.
export async function getOwnedIds(): Promise<Set<string>> {
  return new Set([...freeIds(), ...(await purchasedIds())]);
}

export async function isUnlocked(id: string): Promise<boolean> {
  return (await getOwnedIds()).has(id);
}

// Grant a book (idempotent). Free books are implicitly owned, so we only persist
// paid ones — keeps the stored set meaningful.
export async function unlock(id: string): Promise<void> {
  if (freeIds().includes(id)) return;
  try {
    const owned = new Set(await purchasedIds());
    if (owned.has(id)) return;
    owned.add(id);
    await AsyncStorage.setItem(KEY, JSON.stringify([...owned]));
  } catch {
    // Non-fatal: a failed write just means the user re-purchases/restores later.
  }
}

// Dev/testing helper: clear all purchases (free books stay owned).
export async function resetPurchases(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
