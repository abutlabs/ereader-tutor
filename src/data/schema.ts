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

// How a book entered the library.
export type BookOrigin = "scan" | "epub" | "import";

export interface BookMeta {
  title: string;
  author: string;
  language: string; // BCP-47 of the book's SOURCE language, e.g. "nl-NL"
  readingLang?: string; // language to read in (EPUB: may differ from source → translated)
  targetLanguage?: string; // tutor language — translations/notes written in this; defaults to "English"
  level?: string; // CEFR level (A1…C1) for EPUB rephrasing/notes depth
  origin?: BookOrigin; // scan | epub | import
  status?: BookStatus; // defaults to "open" when absent
  source?: string; // free-text provenance / rights note
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
