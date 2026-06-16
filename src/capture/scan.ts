// Capture pipeline: photograph (or pick) a page → resize → Claude vision →
// structured lesson → append to the book. Uses expo-image-picker /
// expo-image-manipulator, both available in Expo Go, so no dev build needed yet.
// (Phase 1 swaps the picker for the ML Kit document scanner; everything
// downstream is unchanged.)

import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import type { Book } from "../data/schema";
import { languageName, DEFAULT_TARGET_LANGUAGE } from "../data/languages";
import {
  appendPage,
  ensureImagesDir,
  ensurePageAudioDir,
  getBook,
  pageAudioDir,
  pageImagePath,
  renumberPage,
  setPageAudio,
  setPageImage,
  upsertPage,
} from "../storage/books";
import { moveLearned } from "../storage/progress";
import {
  bridgeAudioFileUrl,
  fetchBridgeAudioManifest,
  fetchBridgePageLesson,
  imageToLesson,
  lessonToParagraphs,
  listBridgePages,
  relabelBridgePage,
  submitBridgeJob,
} from "../api/claude";
import type { ModelChoice } from "../storage/apiKey";

export type CaptureSource = "camera" | "library";

// Where the lesson comes from: the paid API (key) or the local Claude Code
// bridge (Max plan). The pipeline downstream is identical either way.
export type TranslateConfig =
  | { source: "api"; apiKey: string; model: ModelChoice }
  | { source: "bridge"; bridgeUrl: string; model: ModelChoice };

// Cap the long edge so Claude's image-token cost stays modest while keeping
// text legible. Claude downsizes large images anyway; ~1568px is a good balance.
const MAX_EDGE = 1568;

export async function captureImage(
  source: CaptureSource,
): Promise<ImagePicker.ImagePickerAsset | null> {
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      throw new Error("Camera permission is needed to scan a page.");
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true, // lets you crop to just the text — helps accuracy
      quality: 1,
    });
    return res.canceled || !res.assets?.[0] ? null : res.assets[0];
  }
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error("Photo access is needed to pick a page.");
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    quality: 1,
  });
  return res.canceled || !res.assets?.[0] ? null : res.assets[0];
}

// Resize + JPEG-compress to base64, capping the long edge.
export async function prepareImage(asset: {
  uri: string;
  width?: number;
  height?: number;
}): Promise<string> {
  const width = asset.width ?? 0;
  const height = asset.height ?? 0;
  const longEdge = Math.max(width, height);

  const actions =
    longEdge === 0
      ? [{ resize: { width: MAX_EDGE } }] // unknown dims — safe default
      : longEdge > MAX_EDGE
        ? [width >= height ? { resize: { width: MAX_EDGE } } : { resize: { height: MAX_EDGE } }]
        : []; // already small enough — just re-encode

  const result = await manipulateAsync(asset.uri, actions, {
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!result.base64) throw new Error("Could not read the image data.");
  return result.base64;
}

export interface ScanResult {
  book: Book;
  pageIdx: number;
}

/**
 * Synchronous API-key pipeline: one captured page → Claude → appended lesson.
 * Used only for the paid-API source; the bridge path is fire-and-forget below.
 * `onPhase` reports progress for the UI. Throws on failure (caller can retry).
 */
export async function processScan(
  bookId: string,
  asset: { uri: string; width?: number; height?: number },
  cfg: TranslateConfig,
  onPhase: (label: string) => void,
): Promise<ScanResult> {
  if (cfg.source !== "api") {
    throw new Error("processScan handles the API path; use queueBridgeScan for the bridge.");
  }
  onPhase("Preparing the image…");
  const base64 = await prepareImage(asset);

  const book0 = await getBook(bookId);
  const sourceLang = languageName(book0?.meta.language);
  const targetLang = book0?.meta.targetLanguage ?? DEFAULT_TARGET_LANGUAGE;

  onPhase("Reading the page with Claude…");
  const lesson = await imageToLesson(base64, cfg.apiKey, cfg.model, sourceLang, targetLang);

  if (!lesson.paragraphs.length) {
    throw new Error("No readable text was found on this page. Try a clearer photo.");
  }

  onPhase("Saving the lesson…");
  const paragraphs = lessonToParagraphs(lesson);
  const book = await appendPage(bookId, {
    title: lesson.pageTitle ?? undefined,
    paragraphs,
  });
  if (!book) throw new Error("Couldn't save the page to this book.");

  return { book, pageIdx: book.pages.length - 1 };
}

export interface QueueResult {
  page: number;
  jobId: string;
}

/**
 * Fire-and-forget bridge scan: resize the image, hand it to the bridge, and
 * return as soon as it's queued. The bridge stamps the page folder "processing"
 * and does the work in the background; the page lands in the app on the next
 * Sync. Returns the page number the bridge assigned.
 */
export async function queueBridgeScan(
  bookId: string,
  asset: { uri: string; width?: number; height?: number },
  cfg: TranslateConfig,
  onPhase: (label: string) => void,
  page?: number, // the book page number the user labelled this upload with
): Promise<QueueResult> {
  if (cfg.source !== "bridge") {
    throw new Error("queueBridgeScan requires the bridge source.");
  }
  onPhase("Preparing the image…");
  const base64 = await prepareImage(asset);

  const book = await getBook(bookId);
  const meta = {
    book: book?.meta.title ?? bookId,
    page, // authoritative when set; bridge auto-allocates if omitted
    sourceLanguage: languageName(book?.meta.language),
    targetLanguage: book?.meta.targetLanguage ?? DEFAULT_TARGET_LANGUAGE,
  };

  onPhase("Sending to the bridge…");
  return submitBridgeJob(base64, cfg.bridgeUrl, cfg.model, meta);
}

// Re-label a page to a new number, locally (authoritative for reading) and on
// the bridge (best-effort folder rename). Returns the updated book + any bridge note.
export async function relabelPage(
  bookId: string,
  oldNum: number,
  newNum: number,
  bridgeUrl?: string,
): Promise<{ book: Book | null; bridgeError?: string }> {
  const book0 = await getBook(bookId);
  const title = book0?.meta.title ?? bookId;
  const updated = await renumberPage(bookId, oldNum, newNum); // throws on local conflict
  await moveLearned(bookId, oldNum, newNum);
  let bridgeError: string | undefined;
  if (bridgeUrl) {
    try {
      await relabelBridgePage(bridgeUrl, title, oldNum, newNum);
    } catch (e) {
      bridgeError = e instanceof Error ? e.message : "Couldn't re-label on the bridge.";
    }
  }
  return { book: updated, bridgeError };
}

export interface SyncResult {
  book: Book | null;
  imported: number;
  available: number;
  processing: number;
}

// Download a page's photo from the bridge to local storage, for offline reading
// (children's-book artwork shown above the text). Optional — never blocks sync.
async function downloadPageImage(
  bridgeUrl: string,
  book: string,
  page: number,
  bookId: string,
): Promise<string | undefined> {
  try {
    await ensureImagesDir(bookId);
    const dest = pageImagePath(bookId, page);
    const url = `${bridgeUrl}/books/${encodeURIComponent(book)}/pages/${page}/image`;
    const res = await FileSystem.downloadAsync(url, dest);
    return res.status === 200 ? res.uri : undefined;
  } catch {
    return undefined;
  }
}

// Download a page's narrated sentence audio from the bridge for offline
// playback. Returns "pg<para>_s<sent>" -> local file uri, or null if the page
// has no audio yet. Already-downloaded files are kept (cheap re-sync). Optional
// like artwork — never blocks sync.
async function downloadPageAudio(
  bridgeUrl: string,
  book: string,
  page: number,
  bookId: string,
): Promise<Map<string, string> | null> {
  try {
    const files = await fetchBridgeAudioManifest(bridgeUrl, book, page);
    if (!files) return null;
    await ensurePageAudioDir(bookId, page);
    const uris = new Map<string, string>();
    for (const [key, file] of Object.entries(files)) {
      const dest = `${pageAudioDir(bookId, page)}${file}`;
      const info = await FileSystem.getInfoAsync(dest);
      if (!info.exists || !info.size) {
        const res = await FileSystem.downloadAsync(
          bridgeAudioFileUrl(bridgeUrl, book, page, file),
          dest,
        );
        if (res.status !== 200) continue;
      }
      uris.set(key, dest);
    }
    return uris.size ? uris : null;
  } catch {
    return null;
  }
}

/**
 * Pull pages the bridge has already produced for this book and import any the
 * app is missing. Lets you recover work the phone never received (e.g. the scan
 * errored mid-poll, or the app was closed when the bridge finished).
 */
export async function syncFromBridge(
  bookId: string,
  bridgeUrl: string,
  onPhase: (label: string) => void,
): Promise<SyncResult> {
  const book = await getBook(bookId);
  if (!book) throw new Error("Couldn't find this book on the device.");
  const title = book.meta.title || bookId;

  onPhase("Checking the bridge…");
  const remote = await listBridgePages(bridgeUrl, title);
  const done = remote.filter((r) => r.status === "done");
  const processing = remote.filter(
    (r) => r.status === "processing" || r.status === "queued",
  ).length;
  const byPage = new Map(book.pages.map((p) => [p.page, p]));

  let updated: Book | null = book;
  let imported = 0;
  for (const r of done) {
    const local = byPage.get(r.page);
    if (!local) {
      onPhase(`Importing page ${r.page}…`);
      const lesson = await fetchBridgePageLesson(bridgeUrl, title, r.page);
      const imageUri = await downloadPageImage(bridgeUrl, title, r.page, bookId);
      const paragraphs = lessonToParagraphs(lesson);
      if (r.audio) {
        onPhase(`Downloading audio for page ${r.page}…`);
        const audio = await downloadPageAudio(bridgeUrl, title, r.page, bookId);
        if (audio) {
          paragraphs.forEach((para, pi) =>
            para.forEach((s, si) => {
              const uri = audio.get(`pg${pi}_s${si}`);
              if (uri) s.audioUrl = uri;
            }),
          );
        }
      }
      updated = await upsertPage(bookId, r.page, {
        title: lesson.pageTitle ?? undefined,
        detectedPage: r.detectedPage,
        imageUri,
        paragraphs,
      });
      imported++;
    } else {
      if (!local.imageUri) {
        // Backfill artwork for a page imported before image-sync existed.
        const imageUri = await downloadPageImage(bridgeUrl, title, r.page, bookId);
        if (imageUri) {
          await setPageImage(bookId, r.page, imageUri);
          updated = await getBook(bookId);
        }
      }
      // Backfill narration for a page imported before its audio was ready.
      if (r.audio && local.paragraphs.some((para) => para.some((s) => !s.audioUrl))) {
        onPhase(`Downloading audio for page ${r.page}…`);
        const audio = await downloadPageAudio(bridgeUrl, title, r.page, bookId);
        if (audio) {
          await setPageAudio(bookId, r.page, audio);
          updated = await getBook(bookId);
        }
      }
    }
  }

  return { book: updated, imported, available: done.length, processing };
}
