// Core data model — content-agnostic so any source (scanned books, public-domain
// texts) fits the same shape. The reader renders BookMeta + Page[].

export interface Word {
  nl: string;
  en: string;
  audioUrl?: string; // optional pre-generated audio (future: ElevenLabs/Google TTS)
}

export interface Note {
  title: string;
  body: string;
}

export interface Sentence {
  id: string; // globally unique, e.g. "p7-s2"
  dutch: string;
  english: string;
  words: Word[];
  notes: Note[];
  audioUrl?: string;
}

export type Paragraph = Sentence[];

export interface Page {
  page: number; // page/unit number — used as the storage key for progress
  detectedPage?: number | null; // page number the model read off the printed page
  imageUri?: string; // local path to the page photo (artwork shown in the reader)
  chapter?: number;
  title?: string; // optional heading shown above the page
  preamble?: string; // non-interactive text continuing from the prior page
  paragraphs: Paragraph[];
}

export interface Chapter {
  number: number;
  title: string;
}

// A book is "open" while you're still scanning pages into it, and "complete"
// once every page is in and set up as a lesson. Marking complete builds an index.
export type BookStatus = "open" | "complete";

export interface BookMeta {
  title: string;
  author: string;
  language: string; // BCP-47 of the SOURCE language being read, e.g. "nl-NL"
  targetLanguage?: string; // language lessons are written in (learner's own); defaults to "English"
  status?: BookStatus; // defaults to "open" when absent
  source?: string;
  chapters?: Chapter[];
}

// A project/book as stored on device.
export interface Book {
  id: string; // kebab-case slug, also the storage folder name
  meta: BookMeta;
  pages: Page[];
  createdAt: number;
  updatedAt: number;
}

// Lightweight listing shape for the projects home screen.
export interface BookSummary {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  pageCount: number;
  updatedAt: number;
}
