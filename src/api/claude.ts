// The Claude pipeline: a scanned page image in, a structured A2 lesson out — in a
// single vision call. React Native isn't a browser, so we hit the REST endpoint
// directly with the device-stored key; no backend, no CORS.
//
// Phase 2 wires this to the document scanner. It's written and usable now: the
// Settings screen calls `pingApiKey`, and `imageToLesson` is ready for the
// scan flow to call.

import type { Paragraph, Sentence } from "../data/schema";
import type { ModelChoice } from "../storage/apiKey";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

// What the model returns — paragraphs of sentences, no ids (assigned on device
// when appended, so ids stay globally unique and collision-free).
export interface LessonResult {
  pageTitle: string | null;
  paragraphs: Array<{
    sentences: Array<{
      dutch: string;
      english: string;
      words: Array<{ nl: string; en: string }>;
      notes: Array<{ title: string; body: string }>;
    }>;
  }>;
}

// JSON Schema for structured outputs. Note the constraints the API requires:
// every object sets additionalProperties:false and lists required fields; no
// minLength / maxLength / numeric bounds (unsupported by structured outputs).
const LESSON_SCHEMA = {
  type: "object",
  properties: {
    pageTitle: {
      type: ["string", "null"],
      description: "Chapter heading if this page begins one, else null.",
    },
    paragraphs: {
      type: "array",
      description: "Paragraphs in reading order.",
      items: {
        type: "object",
        properties: {
          sentences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dutch: {
                  type: "string",
                  description:
                    "The sentence in the natural, modern form of the source language (A2). If the source is archaic, modernize it.",
                },
                english: {
                  type: "string",
                  description: "A faithful translation into the learner's target language.",
                },
                words: {
                  type: "array",
                  description: "Word/phrase-by-phrase breakdown in sentence order.",
                  items: {
                    type: "object",
                    properties: {
                      nl: { type: "string" },
                      en: { type: "string" },
                    },
                    required: ["nl", "en"],
                    additionalProperties: false,
                  },
                },
                notes: {
                  type: "array",
                  description: "A2 grammar/usage notes. Keep each focused and practical.",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      body: { type: "string" },
                    },
                    required: ["title", "body"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["dutch", "english", "words", "notes"],
              additionalProperties: false,
            },
          },
        },
        required: ["sentences"],
        additionalProperties: false,
      },
    },
  },
  required: ["pageTitle", "paragraphs"],
  additionalProperties: false,
} as const;

// The system prompt is built per book from its source + target languages.
function buildSystemPrompt(sourceLang: string, targetLang: string): string {
  return `You are an expert ${sourceLang}-language tutor building study material for an A2 learner who is reading a physical book and photographing its pages. The learner's own language is ${targetLang} — write every translation, explanation, and note in ${targetLang}.

Work efficiently: this is a direct transcription-and-translation task, not a reasoning puzzle. Do not deliberate at length before answering — produce the structured output promptly. Create exactly one entry per sentence as printed; do not split a single sentence into multiple entries.

You will receive a photo of one page. Do the following, faithfully:
1. Read the ${sourceLang} text on the page. Ignore page numbers, running headers, and illustrations.
2. Split it into paragraphs and sentences as they appear.
3. For each sentence, provide:
   - dutch: the sentence in natural, MODERN, everyday ${sourceLang}. If the source uses archaic spelling or dated vocabulary, modernize it to what a ${sourceLang} speaker would say today. Preserve meaning exactly.
   - english: a faithful, natural ${targetLang} translation.
   - words: a word/phrase-by-phrase breakdown in sentence order (group fixed expressions and separable verbs sensibly). "nl" = the ${sourceLang} word/phrase, "en" = its ${targetLang} meaning.
   - notes: 1-4 short A2-pitched grammar/usage notes written in ${targetLang} — word order, verb patterns, common idioms, anything that helps an A2 learner. When you modernized an archaic phrasing, add one note titled "Original" briefly showing what the source said.
Pitch everything at A2. Be concise and concrete. If the page has a chapter heading, put it in pageTitle; otherwise pageTitle is null.

Note: the JSON keys are literally "dutch"/"english" and "nl"/"en" no matter the actual languages — put the ${sourceLang} text under "dutch"/"nl" and the ${targetLang} text under "english"/"en".`;
}

interface AnthropicError {
  error?: { type?: string; message?: string };
}

async function callMessages(body: object, apiKey: string): Promise<any> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": API_VERSION,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = json as AnthropicError;
    const msg = err.error?.message || `HTTP ${res.status}`;
    throw new ClaudeError(msg, res.status, err.error?.type);
  }
  return json;
}

export class ClaudeError extends Error {
  status?: number;
  type?: string;
  constructor(message: string, status?: number, type?: string) {
    super(message);
    this.name = "ClaudeError";
    this.status = status;
    this.type = type;
  }
}

/**
 * Cheap round-trip to verify a key works (used by Settings "Test key").
 * Returns true on a successful 1-token reply; throws ClaudeError otherwise.
 */
export async function pingApiKey(
  apiKey: string,
  model: ModelChoice,
): Promise<boolean> {
  await callMessages(
    {
      model,
      max_tokens: 8,
      messages: [{ role: "user", content: "Reply with the single word: ok" }],
    },
    apiKey,
  );
  return true;
}

/**
 * Turn a base64-encoded page image into a structured lesson. The caller resizes
 * the scan to ~1568px long edge first to control image tokens.
 */
export async function imageToLesson(
  base64Jpeg: string,
  apiKey: string,
  model: ModelChoice,
  sourceLang: string,
  targetLang: string,
): Promise<LessonResult> {
  const json = await callMessages(
    {
      model,
      max_tokens: 8000,
      system: buildSystemPrompt(sourceLang, targetLang),
      output_config: { format: { type: "json_schema", schema: LESSON_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: base64Jpeg },
            },
            {
              type: "text",
              text: "Here is the page. Produce the structured lesson for it.",
            },
          ],
        },
      ],
    },
    apiKey,
  );

  // With output_config.format the first text block is schema-valid JSON.
  const textBlock = (json.content || []).find((b: any) => b.type === "text");
  if (!textBlock?.text) {
    throw new ClaudeError("No lesson returned from the model.");
  }
  return JSON.parse(textBlock.text) as LessonResult;
}

// ─── Local Claude Code bridge (Max plan) ──────────────────────────────────
// Same LessonResult out; the laptop's Claude Code does the vision work, so no
// API key is involved. See bridge/server.mjs.

export async function pingBridge(bridgeUrl: string): Promise<boolean> {
  const res = await fetch(`${bridgeUrl}/health`, { method: "GET" });
  if (!res.ok) throw new ClaudeError(`Bridge responded ${res.status}`, res.status);
  const json = await res.json();
  if (!json?.ok) throw new ClaudeError("Bridge is reachable but not healthy.");
  return true;
}

// Fire-and-forget: hand the page to the bridge and return immediately. The
// bridge stamps the page folder as "processing" and does the vision work in the
// background; the app pulls the finished lesson later via Sync. No polling, so
// the UI is freed the instant the upload completes.
export async function submitBridgeJob(
  base64Jpeg: string,
  bridgeUrl: string,
  model: ModelChoice,
  // Book name + page number so the bridge archives under projects/<book>/Page<N>/,
  // plus the source/target languages so it builds the lesson in the right language.
  meta?: {
    book?: string;
    page?: number;
    sourceLanguage?: string;
    targetLanguage?: string;
  },
): Promise<{ jobId: string; page: number }> {
  let res: Response;
  try {
    res = await fetch(`${bridgeUrl}/lesson`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        image: base64Jpeg,
        model,
        book: meta?.book,
        page: meta?.page,
        sourceLanguage: meta?.sourceLanguage,
        targetLanguage: meta?.targetLanguage,
      }),
    });
  } catch {
    throw new ClaudeError(
      "Couldn't reach the bridge. Is the laptop server running and on the same Wi-Fi?",
    );
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error || !json?.jobId) {
    throw new ClaudeError(json?.error || `Bridge error ${res.status}`, res.status);
  }
  return { jobId: json.jobId as string, page: json.page as number };
}

// ─── Bridge sync (pull archived pages back to the phone) ─────────────────────
// The bridge persists every page it processes under projects/<book>/Page<N>/.
// These let the app list what's on the laptop and import any pages it's missing.

export interface BridgePageInfo {
  page: number;
  status: "queued" | "processing" | "done" | "error";
  sentences: number;
  pageTitle: string | null;
  detectedPage: number | null; // page number the model read off the printed page
}

// Re-label a page on the bridge: rename its Page<old> folder to Page<new>.
export async function relabelBridgePage(
  bridgeUrl: string,
  book: string,
  oldPage: number,
  newPage: number,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${bridgeUrl}/books/${encodeURIComponent(book)}/pages/${oldPage}/relabel`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newPage }),
    });
  } catch {
    throw new ClaudeError("Couldn't reach the bridge to re-label the page.");
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new ClaudeError(j?.error || `Bridge error ${res.status}`, res.status);
  }
}

export async function listBridgePages(
  bridgeUrl: string,
  book: string,
): Promise<BridgePageInfo[]> {
  let res: Response;
  try {
    res = await fetch(`${bridgeUrl}/books/${encodeURIComponent(book)}`);
  } catch {
    throw new ClaudeError(
      "Couldn't reach the bridge. Is the laptop server running and on the same Wi-Fi?",
    );
  }
  if (!res.ok) throw new ClaudeError(`Bridge error ${res.status}`, res.status);
  const json = await res.json();
  return Array.isArray(json?.pages) ? (json.pages as BridgePageInfo[]) : [];
}

// Ask the bridge to (re)build projects/<book>/index.html. Best-effort: called
// when a book is marked complete. Throws ClaudeError on a reachable-but-failing
// bridge so the caller can surface it.
export async function buildBridgeIndex(bridgeUrl: string, book: string): Promise<number> {
  let res: Response;
  try {
    res = await fetch(`${bridgeUrl}/books/${encodeURIComponent(book)}/index`, { method: "POST" });
  } catch {
    throw new ClaudeError("Couldn't reach the bridge to build the index.");
  }
  if (!res.ok) throw new ClaudeError(`Bridge error ${res.status}`, res.status);
  const json = await res.json().catch(() => ({}));
  return typeof json?.pages === "number" ? json.pages : 0;
}

export async function fetchBridgePageLesson(
  bridgeUrl: string,
  book: string,
  page: number,
): Promise<LessonResult> {
  const res = await fetch(`${bridgeUrl}/books/${encodeURIComponent(book)}/pages/${page}`);
  if (!res.ok) throw new ClaudeError(`Bridge error ${res.status}`, res.status);
  const lesson = await res.json();
  if (!Array.isArray(lesson?.paragraphs)) {
    throw new ClaudeError("Bridge returned an unexpected page.");
  }
  return lesson as LessonResult;
}

// Convert a LessonResult into the reader's Page shape (minus page number, which
// appendPage assigns). Sentence ids are placeholders here; appendPage rewrites them.
export function lessonToParagraphs(lesson: LessonResult): Paragraph[] {
  return lesson.paragraphs.map((para) =>
    para.sentences.map<Sentence>((s) => ({
      id: "",
      dutch: s.dutch,
      english: s.english,
      words: s.words,
      notes: s.notes,
    })),
  );
}
