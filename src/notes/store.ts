// Pen notes storage — handwritten strokes per book page, kept on the device
// (AsyncStorage), with JSON export/import for backup or moving devices.
//
// A stroke is anchored to the sentence it was written next to (or the
// paragraph / page top when there is none), and its points are stored relative
// to that anchor at the column width it was drawn at. The reader re-anchors and
// scales strokes when the text reflows (rotation, type size), so a note stays
// beside its sentence.

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Anchor {
  /** Sentence id, when the stroke started beside a sentence. */
  s?: string;
  /** Paragraph index; -1 = top of the page. */
  p: number;
}

export interface Stroke {
  id: string;
  a: Anchor;
  /** Column width (dp) when drawn; points scale with the current width. */
  w: number;
  /** Flattened [x0, y0, x1, y1, …] — x from the column's left, y from the anchor. */
  pts: number[];
  /** Created (ms since epoch). */
  t: number;
}

interface BookNotes {
  title: string;
  pages: Record<string, Stroke[]>; // key = book page number
}

export interface NotesFile {
  app: "ereader-tutor";
  kind: "pen-notes";
  version: 1;
  exported: string;
  books: Record<string, BookNotes>;
}

const PREFIX = "notes:v1:";
const cache = new Map<string, BookNotes>();

async function readBook(bookId: string): Promise<BookNotes> {
  const hit = cache.get(bookId);
  if (hit) return hit;
  let notes: BookNotes = { title: "", pages: {} };
  try {
    const raw = await AsyncStorage.getItem(PREFIX + bookId);
    if (raw) notes = JSON.parse(raw) as BookNotes;
  } catch {
    /* corrupt or unreadable → start empty */
  }
  cache.set(bookId, notes);
  return notes;
}

async function writeBook(bookId: string, notes: BookNotes): Promise<void> {
  cache.set(bookId, notes);
  const empty = Object.keys(notes.pages).length === 0;
  if (empty) await AsyncStorage.removeItem(PREFIX + bookId);
  else await AsyncStorage.setItem(PREFIX + bookId, JSON.stringify(notes));
}

export async function loadPageStrokes(bookId: string, page: number): Promise<Stroke[]> {
  return (await readBook(bookId)).pages[String(page)] ?? [];
}

export async function savePageStrokes(
  bookId: string,
  title: string,
  page: number,
  strokes: Stroke[],
): Promise<void> {
  const prev = await readBook(bookId);
  const pages = { ...prev.pages };
  if (strokes.length) pages[String(page)] = strokes;
  else delete pages[String(page)];
  await writeBook(bookId, { title: title || prev.title, pages });
}

export interface NotesSummary {
  bookId: string;
  title: string;
  pages: { page: number; count: number }[];
  strokes: number;
}

export async function listNotes(): Promise<NotesSummary[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  const out: NotesSummary[] = [];
  for (const k of keys) {
    const bookId = k.slice(PREFIX.length);
    const b = await readBook(bookId);
    const pages = Object.entries(b.pages)
      .map(([p, s]) => ({ page: Number(p), count: s.length }))
      .filter((p) => p.count > 0)
      .sort((x, y) => x.page - y.page);
    if (pages.length) {
      out.push({ bookId, title: b.title || bookId, pages, strokes: pages.reduce((a, p) => a + p.count, 0) });
    }
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

export async function clearBookNotes(bookId: string): Promise<void> {
  await writeBook(bookId, { title: "", pages: {} });
}

export async function exportNotes(): Promise<NotesFile> {
  const books: Record<string, BookNotes> = {};
  for (const s of await listNotes()) books[s.bookId] = await readBook(s.bookId);
  return { app: "ereader-tutor", kind: "pen-notes", version: 1, exported: new Date().toISOString(), books };
}

function isStroke(x: unknown): x is Stroke {
  const s = x as Stroke;
  return (
    !!s &&
    typeof s.id === "string" &&
    typeof s.w === "number" &&
    s.w > 0 &&
    Array.isArray(s.pts) &&
    s.pts.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    !!s.a &&
    typeof s.a.p === "number"
  );
}

/** Merge an exported file into local notes (strokes matched by id). */
export async function importNotes(data: unknown): Promise<{ books: number; added: number }> {
  const file = data as NotesFile;
  if (!file || file.kind !== "pen-notes" || typeof file.books !== "object" || !file.books) {
    throw new Error("Not an EReader Tutor notes file.");
  }
  let books = 0;
  let added = 0;
  for (const [bookId, incoming] of Object.entries(file.books)) {
    if (!incoming || typeof incoming.pages !== "object") continue;
    const local = await readBook(bookId);
    const pages = { ...local.pages };
    let touched = false;
    for (const [page, strokes] of Object.entries(incoming.pages)) {
      if (!Array.isArray(strokes)) continue;
      const have = new Set((pages[page] ?? []).map((s) => s.id));
      const fresh = strokes.filter((s) => isStroke(s) && !have.has(s.id));
      if (fresh.length) {
        pages[page] = [...(pages[page] ?? []), ...fresh];
        added += fresh.length;
        touched = true;
      }
    }
    if (touched) {
      books++;
      await writeBook(bookId, { title: local.title || incoming.title || "", pages });
    }
  }
  return { books, added };
}
