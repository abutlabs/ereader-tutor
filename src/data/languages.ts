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

// Map a language name (as the bridge reports it, e.g. "French") back to a
// BCP-47 tag with a sensible default region, for TTS voices and prompts.
const REGION: Record<string, string> = {
  nl: "nl-NL", en: "en-GB", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT",
  pt: "pt-PT", sv: "sv-SE", da: "da-DK", no: "nb-NO", pl: "pl-PL", ru: "ru-RU",
  uk: "uk-UA", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ar: "ar-SA", tr: "tr-TR",
  el: "el-GR",
};
export function languageCode(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  const hit = Object.entries(NAMES).find(([, v]) => v.toLowerCase() === n);
  if (hit) return REGION[hit[0]] ?? hit[0];
  return /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(name.trim()) ? name.trim() : undefined;
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
