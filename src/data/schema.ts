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
  chapter?: number;
  title?: string; // optional heading shown above the page
  preamble?: string; // non-interactive text continuing from the prior page
  paragraphs: Paragraph[];
}

export interface Chapter {
  number: number;
  title: string;
}

export interface BookMeta {
  title: string;
  author: string;
  language: string; // BCP-47, e.g. "nl-NL"
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
  pageCount: number;
  updatedAt: number;
}
