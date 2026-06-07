// Book repository — persists each project as books/<id>/book.json in the app's
// document directory. On first launch, seeds the bundled Dik Trom book so there's
// something to read immediately. Scanned pages (Phase 2) append to a book's pages[].

// SDK 54 introduced a new File/Directory API; the classic helpers used here
// (documentDirectory, read/writeAsStringAsync, makeDirectory…) live under /legacy.
import * as FileSystem from "expo-file-system/legacy";
import type { Book, BookSummary, BookMeta, Page } from "../data/schema";
import { BOOK_META, BOOK_PAGES } from "../data/dikTrom";

const BOOKS_DIR = FileSystem.documentDirectory + "books/";
const SEED_FLAG = "dik-trom"; // id of the bundled seed book

function bookDir(id: string) {
  return `${BOOKS_DIR}${id}/`;
}
function bookFile(id: string) {
  return `${bookDir(id)}book.json`;
}
export function scansDir(id: string) {
  return `${bookDir(id)}scans/`;
}
export function pageImagePath(id: string, pageNum: number) {
  return `${bookDir(id)}images/Page${pageNum}.jpg`;
}
export async function ensureImagesDir(id: string) {
  await ensureDir(`${bookDir(id)}images/`);
}

async function ensureDir(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

async function ensureSeeded() {
  await ensureDir(BOOKS_DIR);
  const seedPath = bookFile(SEED_FLAG);
  const info = await FileSystem.getInfoAsync(seedPath);
  if (!info.exists) {
    const now = Date.now();
    const seed: Book = {
      id: SEED_FLAG,
      meta: BOOK_META,
      pages: BOOK_PAGES,
      createdAt: now,
      updatedAt: now,
    };
    await ensureDir(bookDir(SEED_FLAG));
    await ensureDir(scansDir(SEED_FLAG));
    await FileSystem.writeAsStringAsync(seedPath, JSON.stringify(seed));
  }
}

export async function listBooks(): Promise<BookSummary[]> {
  await ensureSeeded();
  const entries = await FileSystem.readDirectoryAsync(BOOKS_DIR);
  const summaries: BookSummary[] = [];
  for (const id of entries) {
    const book = await getBook(id);
    if (book) {
      summaries.push({
        id: book.id,
        title: book.meta.title,
        author: book.meta.author,
        status: book.meta.status ?? "open",
        pageCount: book.pages.length,
        updatedAt: book.updatedAt,
      });
    }
  }
  return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getBook(id: string): Promise<Book | null> {
  try {
    const raw = await FileSystem.readAsStringAsync(bookFile(id));
    return JSON.parse(raw) as Book;
  } catch {
    return null;
  }
}

export async function saveBook(book: Book): Promise<void> {
  await ensureDir(bookDir(book.id));
  book.updatedAt = Date.now();
  await FileSystem.writeAsStringAsync(bookFile(book.id), JSON.stringify(book));
}

export async function createBook(meta: BookMeta): Promise<Book> {
  await ensureDir(BOOKS_DIR);
  const id = slugify(meta.title) || `book-${Date.now()}`;
  const now = Date.now();
  const book: Book = {
    id,
    meta: {
      ...meta,
      status: meta.status ?? "open",
      targetLanguage: meta.targetLanguage ?? "English",
    },
    pages: [],
    createdAt: now,
    updatedAt: now,
  };
  await ensureDir(scansDir(id));
  await saveBook(book);
  return book;
}

// Update editable metadata (author, status, …) for a book.
export async function updateBookMeta(
  id: string,
  patch: Partial<BookMeta>,
): Promise<Book | null> {
  const book = await getBook(id);
  if (!book) return null;
  book.meta = { ...book.meta, ...patch };
  await saveBook(book);
  return book;
}

// Append a freshly-processed page and assign stable, globally-unique sentence ids.
export async function appendPage(
  id: string,
  page: Omit<Page, "page">,
): Promise<Book | null> {
  const book = await getBook(id);
  if (!book) return null;
  const pageNum =
    book.pages.reduce((max, p) => Math.max(max, p.page), 0) + 1;
  const withIds: Page = {
    ...page,
    page: pageNum,
    paragraphs: page.paragraphs.map((para, pi) =>
      para.map((s, si) => ({ ...s, id: `p${pageNum}-pg${pi}-s${si}` })),
    ),
  };
  book.pages.push(withIds);
  await saveBook(book);
  return book;
}

// Insert or replace a page at a specific page number — used when syncing pages
// the bridge already produced, so the app keeps the bridge's page numbering.
export async function upsertPage(
  id: string,
  pageNumber: number,
  page: Omit<Page, "page">,
): Promise<Book | null> {
  const book = await getBook(id);
  if (!book) return null;
  const withIds: Page = {
    ...page,
    page: pageNumber,
    paragraphs: page.paragraphs.map((para, pi) =>
      para.map((s, si) => ({ ...s, id: `p${pageNumber}-pg${pi}-s${si}` })),
    ),
  };
  const idx = book.pages.findIndex((p) => p.page === pageNumber);
  if (idx >= 0) book.pages[idx] = withIds;
  else {
    book.pages.push(withIds);
    book.pages.sort((a, b) => a.page - b.page);
  }
  await saveBook(book);
  return book;
}

// Re-label a page to a different number (e.g. fix "Page 1" that's really book
// page 7). Sentence ids are intentionally left unchanged — they're opaque and
// the learned-progress set references them by id, so they stay matched.
export async function renumberPage(
  id: string,
  oldNum: number,
  newNum: number,
): Promise<Book | null> {
  const book = await getBook(id);
  if (!book) return null;
  if (oldNum === newNum) return book;
  const page = book.pages.find((p) => p.page === oldNum);
  if (!page) throw new Error(`Page ${oldNum} not found.`);
  if (book.pages.some((p) => p.page === newNum)) {
    throw new Error(`Page ${newNum} already exists in this book.`);
  }
  page.page = newNum;
  book.pages.sort((a, b) => a.page - b.page);
  await saveBook(book);
  return book;
}

// Set a page's local image path without touching its content (so learned
// progress / sentence ids stay intact). Used to backfill artwork on existing pages.
export async function setPageImage(
  id: string,
  pageNum: number,
  imageUri: string,
): Promise<void> {
  const book = await getBook(id);
  if (!book) return;
  const p = book.pages.find((pp) => pp.page === pageNum);
  if (p) {
    p.imageUri = imageUri;
    await saveBook(book);
  }
}

export async function deleteBook(id: string): Promise<void> {
  if (id === SEED_FLAG) return; // keep the bundled sample
  await FileSystem.deleteAsync(bookDir(id), { idempotent: true });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
