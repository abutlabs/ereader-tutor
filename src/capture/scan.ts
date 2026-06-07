// Capture pipeline: photograph (or pick) a page → resize → Claude vision →
// structured lesson → append to the book. Uses expo-image-picker /
// expo-image-manipulator, both available in Expo Go, so no dev build needed yet.
// (Phase 1 swaps the picker for the ML Kit document scanner; everything
// downstream is unchanged.)

import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { Book } from "../data/schema";
import { appendPage } from "../storage/books";
import { imageToLesson, lessonToParagraphs } from "../api/claude";
import type { ModelChoice } from "../storage/apiKey";

export type CaptureSource = "camera" | "library";

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
 * Full pipeline for one captured page. `onPhase` reports progress for the UI.
 * Throws on any failure (caller shows a retryable error).
 */
export async function processScan(
  bookId: string,
  asset: { uri: string; width?: number; height?: number },
  apiKey: string,
  model: ModelChoice,
  onPhase: (label: string) => void,
): Promise<ScanResult> {
  onPhase("Preparing the image…");
  const base64 = await prepareImage(asset);

  onPhase("Reading the page with Claude…");
  const lesson = await imageToLesson(base64, apiKey, model);

  if (!lesson.paragraphs.length) {
    throw new Error("No Dutch text was found on this page. Try a clearer photo.");
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
