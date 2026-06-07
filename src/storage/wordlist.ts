// A per-book study list of saved words/phrases — the ones you find interesting
// or hard to remember. Separate from "learned" (a single tap ≠ actually learned).
// Persisted in AsyncStorage, keyed by book.

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedWord {
  nl: string; // source word/phrase
  en: string; // its meaning
  addedAt: number;
  page?: number; // book page it came from, for context
}

function key(bookId: string) {
  return `wordlist:${bookId}`;
}

// Normalise the source word/phrase so the same item toggles consistently.
export function normWord(nl: string) {
  return nl.trim().toLowerCase();
}

export async function loadWordlist(bookId: string): Promise<SavedWord[]> {
  try {
    const raw = await AsyncStorage.getItem(key(bookId));
    return raw ? (JSON.parse(raw) as SavedWord[]) : [];
  } catch {
    return [];
  }
}

async function save(bookId: string, items: SavedWord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key(bookId), JSON.stringify(items));
  } catch {
    // Non-fatal — the study list is a nicety.
  }
}

// Add the word if it's not saved, remove it if it is. Returns the updated list.
export async function toggleWord(
  bookId: string,
  word: { nl: string; en: string },
  page?: number,
): Promise<SavedWord[]> {
  const items = await loadWordlist(bookId);
  const k = normWord(word.nl);
  const idx = items.findIndex((it) => normWord(it.nl) === k);
  const next =
    idx >= 0
      ? items.filter((_, i) => i !== idx)
      : [{ nl: word.nl, en: word.en, addedAt: Date.now(), page }, ...items];
  await save(bookId, next);
  return next;
}

export async function removeWord(bookId: string, nl: string): Promise<SavedWord[]> {
  const items = await loadWordlist(bookId);
  const next = items.filter((it) => normWord(it.nl) !== normWord(nl));
  await save(bookId, next);
  return next;
}

// Set of normalised keys, for quick "is this saved?" checks in the UI.
export function savedKeys(items: SavedWord[]): Set<string> {
  return new Set(items.map((it) => normWord(it.nl)));
}
