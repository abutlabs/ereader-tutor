// Per-page "learned" progress, persisted in AsyncStorage. Keyed by book + page
// so marks stay scoped where you found them (matches the prototype's behavior).

import AsyncStorage from "@react-native-async-storage/async-storage";

function key(bookId: string, pageNum: number) {
  return `progress:${bookId}:p${pageNum}:learned`;
}

export async function loadLearned(
  bookId: string,
  pageNum: number,
): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key(bookId, pageNum));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function saveLearned(
  bookId: string,
  pageNum: number,
  learned: Set<string>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      key(bookId, pageNum),
      JSON.stringify([...learned]),
    );
  } catch {
    // Non-fatal — progress is a nicety, never block reading.
  }
}

// Remember the last page index read in each book, so reopening resumes there
// (an improvement over the web prototype, which always reset to page 1).
function lastPageKey(bookId: string) {
  return `progress:${bookId}:lastPageIdx`;
}

export async function saveLastPageIdx(bookId: string, idx: number): Promise<void> {
  try {
    await AsyncStorage.setItem(lastPageKey(bookId), String(idx));
  } catch {
    // Non-fatal.
  }
}

export async function loadLastPageIdx(bookId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(lastPageKey(bookId));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}
