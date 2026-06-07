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
                    "The sentence in natural, modern Dutch (A2). If the source is archaic, modernize it.",
                },
                english: { type: "string", description: "Faithful English translation." },
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

const SYSTEM_PROMPT = `You are an expert Dutch-language tutor building study material for an A2 learner who is reading a physical book and photographing its pages.

You will receive a photo of one page. Do the following, faithfully:
1. Read the Dutch text on the page. Ignore page numbers, running headers, and illustrations.
2. Split it into paragraphs and sentences as they appear.
3. For each sentence, provide:
   - dutch: the sentence in natural, MODERN, everyday Dutch. If the source uses archaic spelling or dated vocabulary (pre-1950s children's literature often does), modernize it to what a Dutch speaker would say today. Preserve meaning exactly.
   - english: a faithful, natural English translation.
   - words: a word/phrase-by-phrase breakdown in sentence order (group fixed expressions and separable verbs sensibly).
   - notes: 1-4 short A2-pitched grammar/usage notes — V2 word order, separable/reflexive verbs, modal past tenses, common idioms, weten vs kennen, diminutives, etc. When you modernized an archaic phrasing, add one note titled "Origineel" briefly showing what the source said.
Pitch everything at A2. Be concise and concrete. If the page has a chapter heading, put it in pageTitle; otherwise pageTitle is null.`;

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
): Promise<LessonResult> {
  const json = await callMessages(
    {
      model,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
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
