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

// Move a page's learned set when the page is re-labelled to a new number.
export async function moveLearned(
  bookId: string,
  oldNum: number,
  newNum: number,
): Promise<void> {
  if (oldNum === newNum) return;
  try {
    const s = await loadLearned(bookId, oldNum);
    if (s.size) await saveLearned(bookId, newNum, s);
    await AsyncStorage.removeItem(key(bookId, oldNum));
  } catch {
    // Non-fatal — progress is a nicety.
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

// ─── Daily goal + streak ─────────────────────────────────────────────────────
// Drives the Hearth daily-progress ring and the streak flame. `count` is the
// sentences learned today (resets at local midnight); `streak` is consecutive
// days the goal was met; `lastGoalDate` is the last day it was met.

export const DEFAULT_DAILY_GOAL = 20;
const DAILY_KEY = "progress:daily";

export interface DailyState {
  date: string; // YYYY-MM-DD the count applies to
  count: number;
  goal: number;
  streak: number;
  lastGoalDate: string | null;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function dayDiff(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86_400_000);
}

function fresh(): DailyState {
  return { date: todayStr(), count: 0, goal: DEFAULT_DAILY_GOAL, streak: 0, lastGoalDate: null };
}

export async function loadDaily(): Promise<DailyState> {
  let s: DailyState;
  try {
    const raw = await AsyncStorage.getItem(DAILY_KEY);
    s = raw ? { ...fresh(), ...(JSON.parse(raw) as DailyState) } : fresh();
  } catch {
    s = fresh();
  }
  const today = todayStr();
  if (s.date !== today) {
    // New day: reset today's count; break the streak if the last met-goal day
    // is now more than one day behind (a full day was missed).
    s.date = today;
    s.count = 0;
    if (!s.lastGoalDate || dayDiff(s.lastGoalDate, today) > 1) s.streak = 0;
    await persist(s);
  }
  return s;
}

async function persist(s: DailyState): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(s));
  } catch {
    // Non-fatal.
  }
}

// Count one freshly-learned sentence. Returns the new state plus `justCompleted`
// (true the moment today crosses the goal — used to fire Session Complete).
export async function recordLearned(): Promise<DailyState & { justCompleted: boolean }> {
  const s = await loadDaily();
  const prev = s.count;
  s.count = prev + 1;
  let justCompleted = false;
  if (prev < s.goal && s.count >= s.goal && s.lastGoalDate !== s.date) {
    justCompleted = true;
    const today = todayStr();
    s.streak = s.lastGoalDate && dayDiff(s.lastGoalDate, today) === 1 ? s.streak + 1 : 1;
    s.lastGoalDate = today;
  }
  await persist(s);
  return { ...s, justCompleted };
}

export async function setDailyGoal(goal: number): Promise<DailyState> {
  const s = await loadDaily();
  s.goal = Math.max(1, Math.round(goal));
  await persist(s);
  return s;
}
