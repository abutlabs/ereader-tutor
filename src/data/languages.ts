// Language helpers for the tutor. The book's `language` (BCP-47, e.g. "nl-NL")
// is the SOURCE language being read; `targetLanguage` is the language lessons
// are explained in (the learner's own language). Both feed the Claude prompts.

const NAMES: Record<string, string> = {
  nl: "Dutch",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  pl: "Polish",
  ru: "Russian",
  uk: "Ukrainian",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ar: "Arabic",
  tr: "Turkish",
  el: "Greek",
  la: "Latin",
};

// Map a BCP-47 code (or a bare name) to a human language name for prompts/UI.
export function languageName(code: string | undefined): string {
  if (!code) return "the source language";
  const primary = code.toLowerCase().split(/[-_]/)[0];
  return NAMES[primary] ?? code;
}

// Quick-pick options for the editor (the learner's language).
export const COMMON_TARGET_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Dutch",
  "Italian",
  "Portuguese",
];

export const DEFAULT_TARGET_LANGUAGE = "English";
