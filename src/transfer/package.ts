// Book export / import as a `.zip` package (Hearth). Bundles the lesson content,
// page photos, progress, and word list into one portable, versioned, checksummed
// file. Build → expo-sharing; pick → expo-document-picker; install → storage.

import JSZip from "jszip";
import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import * as Sharing from "expo-sharing";
import type { Book, Page } from "../data/schema";
import {
  ensureImagesDir,
  getBook,
  pageImagePath,
  saveBook,
  upsertPage,
} from "../storage/books";
import {
  loadLastPageIdx,
  loadLearned,
  saveLastPageIdx,
  saveLearned,
} from "../storage/progress";
import { loadWordlist, replaceWordlist, type SavedWord } from "../storage/wordlist";

const FORMAT_VERSION = 1;
const B64 = FileSystem.EncodingType.Base64;

export interface ExportFlags {
  photos: boolean;
  progress: boolean;
  wordlist: boolean;
}

export interface Manifest {
  formatVersion: number;
  exportedAt: number;
  book: { id: string; title: string; author: string; language: string; status?: string };
  pageCount: number;
  sha256: string;
  flags: ExportFlags;
  source?: string | null;
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}
function safeName(s: string) {
  return s.replace(/[^\p{L}\p{N} _-]/gu, "").trim().replace(/\s+/g, "_") || "Book";
}
function sha256(s: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, s);
}

// ── Build & share ────────────────────────────────────────────────────────────
export interface BuiltPackage {
  uri: string;
  name: string;
  size: number;
}

export async function buildPackage(bookId: string, flags: ExportFlags): Promise<BuiltPackage> {
  const book = await getBook(bookId);
  if (!book) throw new Error("Book not found.");

  // Lesson content, minus device-local image paths (re-linked on import).
  const exportBook: Book = { ...book, pages: book.pages.map((p) => ({ ...p, imageUri: undefined })) };
  const bookJson = JSON.stringify(exportBook);
  const hash = await sha256(bookJson);

  const zip = new JSZip();
  zip.file("book.json", bookJson);
  const manifest: Manifest = {
    formatVersion: FORMAT_VERSION,
    exportedAt: Date.now(),
    book: {
      id: book.id,
      title: book.meta.title,
      author: book.meta.author,
      language: book.meta.language,
      status: book.meta.status,
    },
    pageCount: book.pages.length,
    sha256: hash,
    flags,
    source: book.meta.source ?? null,
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  if (flags.photos) {
    const img = zip.folder("images")!;
    for (const p of book.pages) {
      if (!p.imageUri) continue;
      try {
        img.file(`page-${pad3(p.page)}.jpg`, await FileSystem.readAsStringAsync(p.imageUri, { encoding: B64 }), {
          base64: true,
        });
      } catch {
        /* skip a missing image */
      }
    }
  }
  if (flags.progress) {
    const learned: Record<number, string[]> = {};
    for (const p of book.pages) {
      const set = await loadLearned(book.id, p.page);
      if (set.size) learned[p.page] = [...set];
    }
    zip.file("progress.json", JSON.stringify({ lastPageIdx: await loadLastPageIdx(book.id), learned }));
  }
  if (flags.wordlist) {
    zip.file("wordlist.json", JSON.stringify(await loadWordlist(book.id)));
  }

  const b64 = await zip.generateAsync({ type: "base64", compression: "DEFLATE" });
  const name = `${safeName(book.meta.title)}${flags.progress ? "" : "-clean"}.zip`;
  const uri = `${FileSystem.cacheDirectory}${name}`;
  await FileSystem.writeAsStringAsync(uri, b64, { encoding: B64 });
  const info = await FileSystem.getInfoAsync(uri);
  return { uri, name, size: (info as { size?: number }).size ?? 0 };
}

export async function sharePackage(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/zip", dialogTitle: "Share book package" });
  }
}

// Pre-build size estimate for the export screen (downsized scans ≈ 0.18 MB each).
export function estimateSize(pageCount: number, flags: ExportFlags): number {
  let mb = 0.28;
  if (flags.photos) mb += pageCount * 0.18;
  if (flags.progress) mb += 0.04;
  if (flags.wordlist) mb += 0.03;
  return mb * 1024 * 1024;
}

export function formatBytes(b: number): string {
  if (b < 1024 * 1024) return `${Math.max(1, Math.round(b / 1024))} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Preview & install ────────────────────────────────────────────────────────
export interface PackagePreview {
  manifest: Manifest;
  valid: boolean;
  exists: boolean; // a book with this id is already in the library
}
export type InstallMode = "new" | "merge" | "replace" | "copy";

async function loadZip(uri: string): Promise<JSZip> {
  return JSZip.loadAsync(await FileSystem.readAsStringAsync(uri, { encoding: B64 }), { base64: true });
}

export async function previewPackage(uri: string): Promise<PackagePreview> {
  const zip = await loadZip(uri);
  const mf = zip.file("manifest.json");
  const bf = zip.file("book.json");
  if (!mf || !bf) throw new Error("Not a Hearth book package (.zip).");
  const manifest = JSON.parse(await mf.async("string")) as Manifest;
  const bookJson = await bf.async("string");
  const valid = (await sha256(bookJson)) === manifest.sha256;
  return { manifest, valid, exists: !!(await getBook(manifest.book.id)) };
}

export async function installPackage(uri: string, mode: InstallMode): Promise<Book> {
  const zip = await loadZip(uri);
  const incoming = JSON.parse(await zip.file("book.json")!.async("string")) as Book;

  let id = incoming.id;
  let title = incoming.meta.title;
  if (mode === "copy") {
    id = `${incoming.id}-copy-${Date.now().toString(36)}`;
    title = `${title} (copy)`;
  }

  const imageFor = async (pageNum: number): Promise<string | undefined> => {
    const f = zip.file(`images/page-${pad3(pageNum)}.jpg`);
    if (!f) return undefined;
    await ensureImagesDir(id);
    const dest = pageImagePath(id, pageNum);
    await FileSystem.writeAsStringAsync(dest, await f.async("base64"), { encoding: B64 });
    return dest;
  };

  if (mode === "merge") {
    const existing = await getBook(id);
    if (!existing) throw new Error("Nothing to merge into.");
    let book = existing;
    for (const p of incoming.pages) {
      if (existing.pages.some((e) => e.page === p.page)) continue; // keep your version
      const updated = await upsertPage(id, p.page, {
        title: p.title,
        detectedPage: p.detectedPage,
        imageUri: await imageFor(p.page),
        paragraphs: p.paragraphs,
      });
      if (updated) book = updated;
    }
    return book;
  }

  // new / replace / copy → write the whole book.
  const now = Date.now();
  const pages: Page[] = [];
  for (const p of incoming.pages) pages.push({ ...p, imageUri: await imageFor(p.page) });
  const book: Book = {
    id,
    meta: { ...incoming.meta, title, origin: "import" },
    pages,
    createdAt: incoming.createdAt ?? now,
    updatedAt: now,
  };
  await saveBook(book);

  if (mode !== "copy") {
    const pf = zip.file("progress.json");
    if (pf) {
      try {
        const prog = JSON.parse(await pf.async("string"));
        if (typeof prog.lastPageIdx === "number") await saveLastPageIdx(id, prog.lastPageIdx);
        for (const [pageNum, ids] of Object.entries(prog.learned || {})) {
          await saveLearned(id, Number(pageNum), new Set(ids as string[]));
        }
      } catch {
        /* progress optional */
      }
    }
  }
  const wf = zip.file("wordlist.json");
  if (wf) {
    try {
      await replaceWordlist(id, JSON.parse(await wf.async("string")) as SavedWord[]);
    } catch {
      /* wordlist optional */
    }
  }
  return book;
}
