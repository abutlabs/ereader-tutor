// Local Claude Code bridge — lets the phone app produce lessons through your
// Claude **Max** subscription instead of paid API credits.
//
// The phone POSTs a page image here; this server runs Claude Code headless
// (`claude -p`), which is authenticated by your Max plan, to read the image and
// return the structured lesson. No API key, no per-token billing.
//
// The work is async: POST /lesson returns a { jobId } immediately and processes
// in the background; the phone polls GET /job/<id> for live progress and pulls
// the lesson when it's done. A slow page never holds an HTTP request open (no
// socket timeouts), and the phone can show real progress.
//
// Run it on the laptop that's logged into Claude Code:
//     node bridge/server.mjs
// It prints a URL like http://192.168.1.20:8788 — paste that into the app's
// Settings → Translation source → Local Claude Code (Max).
//
// Requirements: the `claude` CLI on your PATH and signed in (it is, if Claude
// Code works in your terminal). Phone and laptop on the same Wi-Fi (or a tunnel).

import http from "node:http";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT) || 8788;
// Generous per-attempt ceiling — a dense page on Opus with thinking can run
// minutes. The phone polls, so a long job doesn't tie up any socket.
const CLAUDE_TIMEOUT_MS = Number(process.env.CLAUDE_TIMEOUT_MS) || 600_000;
const MAX_BODY_BYTES = 25 * 1024 * 1024; // ~25MB, plenty for one JPEG
const JOB_TTL_MS = 30 * 60_000; // keep finished jobs pollable for 30 min
// Transcribe + translate is not a reasoning task — force low effort so the model
// doesn't burn minutes "thinking". (low|medium|high|xhigh|max)
const EFFORT = process.env.EFFORT || "low";

// Map the app's model ids to Claude Code aliases.
const MODEL_ALIAS = {
  "claude-opus-4-8": "opus",
  "claude-sonnet-4-6": "sonnet",
};

// Timestamped logging so you can watch each request in the terminal. Log lines
// scroll above the live job dashboard (see "Terminal dashboard" below), so every
// write clears and repaints the dashboard block.
function ts() {
  return new Date().toLocaleTimeString();
}
function log(...args) {
  clearDash();
  console.log(`[${ts()}]`, ...args);
  renderDash();
}

// Stage 1 — transcription only. Fast: just the source text, no translation.
function transcribePrompt(sourceLanguage = "Dutch") {
  return `Transcribe the ${sourceLanguage} text from the image ./page.jpg in the current directory. It is a photograph of a single page OR a two-page spread (an open book). Transcribe ALL the body text in natural reading order — for a spread, the whole left page first, then the whole right page, as one continuous sequence. Ignore page numbers, running headers, and illustrations (the artwork is shown separately). Lightly modernize archaic spelling but keep the wording faithful. Do NOT translate.

Work efficiently: this is a direct transcription task, not a reasoning puzzle — produce the JSON promptly. Split into paragraphs and sentences exactly as printed: one entry per sentence, do not split clauses. If the page has a chapter heading, set pageTitle to it; otherwise null.

Also report the PRINTED page number shown on the page (usually in a header or footer corner) as "pageNumber" — an integer if one is clearly visible, otherwise null. Do not guess or infer it.

Output ONLY a single minified JSON object, no markdown, no commentary, of exactly this shape:
{"pageTitle": string|null, "pageNumber": number|null, "paragraphs": [ ["first sentence.", "second sentence."], ["a sentence in the next paragraph."] ]}`;
}

// Stage 2 — enrich the transcript into the full lesson (text-only, no image).
// The JSON keys stay "dutch"/"english"/"nl"/"en" regardless of the languages.
// When the page is fanned out into chunks, each chunk gets only its own
// paragraphs (partOfPage=true) and the merge step reassembles them in order.
function enrichPrompt(sourceLanguage = "Dutch", targetLanguage = "English", transcript = {}, partOfPage = false) {
  const scope = partOfPage ? "part of one book page" : "one book page";
  return `You are an expert ${sourceLanguage}-language tutor for an A2 learner whose own language is ${targetLanguage}. Write every translation, explanation, and note in ${targetLanguage}.

Below is the transcribed ${sourceLanguage} text of ${scope} (paragraphs of sentences). For EACH sentence, produce a study entry — keep the same sentences in the same order.

Work efficiently: produce the JSON promptly without lengthy deliberation. For each sentence provide:
- dutch: the sentence in natural, modern ${sourceLanguage} (you may lightly clean it; preserve meaning).
- english: a faithful, natural ${targetLanguage} translation.
- words: a word/phrase-by-phrase breakdown. "nl" = the ${sourceLanguage} word/phrase, "en" = its ${targetLanguage} meaning.
- notes: 1-4 short A2 grammar/usage notes in ${targetLanguage}. If you modernized an archaic phrasing, add one note titled "Original" with the source wording.

Transcript (keep its pageTitle):
${JSON.stringify(transcript)}

Output ONLY a single minified JSON object, no markdown, no commentary. Put ${sourceLanguage} text under "dutch"/"nl" and ${targetLanguage} text under "english"/"en". The exact shape is:
{"pageTitle": string|null, "paragraphs": [ { "sentences": [ { "dutch": string, "english": string, "words": [ {"nl": string, "en": string} ], "notes": [ {"title": string, "body": string} ] } ] } ] }`;
}

function lanUrls() {
  const urls = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const ni of ifaces[name] || []) {
      if (ni.family === "IPv4" && !ni.internal) {
        urls.push(`http://${ni.address}:${PORT}`);
      }
    }
  }
  return urls;
}

// ─── Persistence ─────────────────────────────────────────────────────────────
// Each scanned page is archived to projects/<book>/Page<N>.{jpg,nl.txt,json,html}
// so the work survives the phone: the source image, the extracted Dutch text,
// the structured lesson, and the formatted study page. Anchored to the repo root
// (not the cwd) so it lands in the same place however you launch the server.
const BRIDGE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(BRIDGE_DIR, "..");
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.join(REPO_ROOT, "projects");

function bookLabel(name) {
  return typeof name === "string" && name.trim() ? name.trim() : "Untitled";
}

// Folder-safe version of the book name (keeps letters/digits/space/-/_).
function safeBookName(name) {
  const s = bookLabel(name).replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, "_");
  return s || "Untitled";
}

// If the phone didn't send a page number, continue numbering from what's on disk.
async function nextPageNumber(book) {
  const dir = path.join(PROJECTS_DIR, safeBookName(book));
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let max = 0;
    for (const e of entries) {
      const m = e.isDirectory() && e.name.match(/^Page(\d+)$/);
      if (m) max = Math.max(max, Number(m[1]));
    }
    return max + 1;
  } catch {
    return 1;
  }
}

// List the pages already archived for a book — the manifest the phone syncs from.
async function listBookPages(book) {
  const dir = path.join(PROJECTS_DIR, safeBookName(book));
  const pages = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return pages; // no folder yet → nothing archived
  }
  for (const e of entries) {
    const m = e.isDirectory() && e.name.match(/^Page(\d+)$/);
    if (!m) continue;
    const pageNum = Number(m[1]);
    const pdir = path.join(dir, e.name);
    let status = null;
    let stage = null;
    let sentences = 0;
    let pageTitle = null;
    let detectedPage = null;
    try {
      const s = JSON.parse(await fs.readFile(path.join(pdir, "status.json"), "utf8"));
      status = s.status; // "queued" | "processing" | "done" | "error"
      stage = s.stage ?? null; // "transcribing" | "transcribed" | "enriching" | "done"
      detectedPage = s.detectedPage ?? null;
    } catch {
      /* no status file (e.g. a migrated page) — infer from lesson.json below */
    }
    try {
      const lesson = JSON.parse(await fs.readFile(path.join(pdir, "lesson.json"), "utf8"));
      sentences = (lesson.paragraphs || []).reduce((a, p) => a + (p.sentences?.length || 0), 0);
      pageTitle = lesson.pageTitle ?? null;
      if (!status) status = "done";
    } catch {
      if (!status) continue; // neither status.json nor lesson.json → skip
    }
    const audio = await fs
      .access(path.join(pdir, "audio", "manifest.json"))
      .then(() => true, () => false);
    pages.push({ page: pageNum, status, stage, sentences, pageTitle, detectedPage, audio });
  }
  pages.sort((a, b) => a.page - b.page);
  return pages;
}

// Read one archived page's structured lesson (what the phone imports).
async function readBookPageLesson(book, page) {
  const file = path.join(PROJECTS_DIR, safeBookName(book), `Page${page}`, "lesson.json");
  return JSON.parse(await fs.readFile(file, "utf8"));
}

// Write a page's status marker. Created as "processing" the instant a photo
// arrives (so there's an immediate durable record), then updated to "done"/"error".
async function writeStatus(book, page, obj) {
  const dir = path.join(PROJECTS_DIR, safeBookName(book), `Page${page}`);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "status.json"), JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

// The "final product": a self-contained, readable study page.
function renderLessonHtml(lesson, book, page) {
  const heading = lesson.pageTitle ? esc(lesson.pageTitle) : `Page ${page}`;
  const body = lesson.paragraphs
    .map(
      (p) =>
        `<div class="para">` +
        (p.sentences || [])
          .map(
            (s) => `
      <div class="sentence">
        <p class="nl">${esc(s.dutch)}</p>
        <p class="en">${esc(s.english)}</p>
        ${
          (s.words || []).length
            ? `<ul class="words">${s.words
                .map((w) => `<li><span class="w-nl">${esc(w.nl)}</span> <span class="w-en">${esc(w.en)}</span></li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          (s.notes || []).length
            ? `<div class="notes">${s.notes
                .map((n) => `<div class="note"><b>${esc(n.title)}</b> ${esc(n.body)}</div>`)
                .join("")}</div>`
            : ""
        }
      </div>`,
          )
          .join("") +
        `</div>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(book)} — ${heading}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: Georgia, "Iowan Old Style", serif; line-height: 1.5; margin: 0; background: #f4f1ea; color: #1c1a17; }
  main { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  header { border-bottom: 1px solid #d8d2c4; padding-bottom: 1rem; margin-bottom: 1.5rem; }
  .book { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: #8a7f6b; }
  h1 { font-size: 1.6rem; margin: .25rem 0 0; }
  .sentence { padding: .85rem 0; border-bottom: 1px solid #ece7da; }
  .nl { font-size: 1.18rem; margin: 0 0 .25rem; }
  .en { color: #6b6253; font-style: italic; margin: 0 0 .5rem; }
  .words { list-style: none; padding: 0; margin: .25rem 0 .5rem; display: flex; flex-wrap: wrap; gap: .35rem; }
  .words li { font-size: .82rem; background: #eee8da; border-radius: .4rem; padding: .15rem .5rem; }
  .w-nl { font-weight: 600; }
  .w-en { color: #7a7160; }
  .note { font-size: .85rem; background: #fbf9f3; border-left: 3px solid #c89b5a; padding: .35rem .6rem; margin: .3rem 0; border-radius: 0 .3rem .3rem 0; }
  .note b { color: #9a6f2e; }
</style>
</head>
<body>
<main>
  <header>
    <div class="book">${esc(book)} · Page ${page}</div>
    <h1>${heading}</h1>
  </header>
  ${body}
</main>
</body>
</html>
`;
}

// The book index: projects/<book>/index.html linking every page's study page.
function renderIndexHtml(book, pages) {
  const rows = pages
    .map((p) => {
      const detail =
        p.status === "done" ? `${p.sentences} sentence${p.sentences === 1 ? "" : "s"}` : p.status;
      const inner =
        `<span class="n">Page ${p.page}</span>` +
        `<span class="t">${esc(p.pageTitle || "—")}</span>` +
        `<span class="c">${detail}</span>`;
      return p.status === "done"
        ? `      <li><a href="Page${p.page}/page.html">${inner}</a></li>`
        : `      <li><span class="pending">${inner}</span></li>`;
    })
    .join("\n");
  const totalSentences = pages.reduce((a, p) => a + (p.status === "done" ? p.sentences : 0), 0);
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(book)} — Index</title>
<style>
  body { font-family: Georgia, "Iowan Old Style", serif; line-height: 1.5; margin: 0; background: #f4f1ea; color: #1c1a17; }
  main { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  .kicker { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: #8a7f6b; }
  h1 { font-size: 1.9rem; margin: .25rem 0 .35rem; }
  .summary { color: #6b6253; margin: 0 0 1.5rem; }
  ol { list-style: none; padding: 0; margin: 0; }
  li a { display: flex; align-items: baseline; gap: .75rem; padding: .7rem .25rem; border-bottom: 1px solid #e4ddcd; text-decoration: none; color: inherit; }
  li a:hover { background: #efe9da; }
  .pending { display: flex; align-items: baseline; gap: .75rem; padding: .7rem .25rem; border-bottom: 1px solid #e4ddcd; color: #a99e88; font-style: italic; }
  .n { font-weight: 600; color: #9a6f2e; min-width: 4.5rem; }
  .t { flex: 1; }
  .c { font-size: .8rem; color: #8a7f6b; }
</style>
</head>
<body>
<main>
  <p class="kicker">EReader Tutor</p>
  <h1>${esc(book)}</h1>
  <p class="summary">${pages.length} page${pages.length === 1 ? "" : "s"} · ${totalSentences} sentences</p>
  <ol>
${rows}
  </ol>
</main>
</body>
</html>
`;
}

// (Re)build projects/<book>/index.html from whatever pages are on disk.
async function rebuildIndex(book) {
  const pages = await listBookPages(book);
  const dir = path.join(PROJECTS_DIR, safeBookName(book));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), renderIndexHtml(bookLabel(book), pages), "utf8");
  return { dir, count: pages.length };
}

// ─── Jobs ───────────────────────────────────────────────────────────────────
// In-memory store. id → job. Finished jobs are swept on a TTL so the phone has
// time to pull the result even if it polls a little late.
const jobs = new Map();

function createJob(meta) {
  const id = randomUUID();
  const job = {
    status: "pending", // pending | running | done | error
    phase: "Queued",
    book: bookLabel(meta.book),
    page: meta.page,
    startedAt: Date.now(),
    finishedAt: null,
    sentences: null,
    lesson: null,
    savedTo: null,
    error: null,
    // Dashboard state: pipeline stage, output chars so far, stage-2 chunk progress.
    stage: null,
    chars: 0,
    chunkDone: 0,
    chunkTotal: 0,
  };
  jobs.set(id, job);
  return { id, job };
}

function jobView(job) {
  const until = job.finishedAt ?? Date.now();
  return {
    status: job.status,
    phase: job.phase,
    elapsedSec: Math.round((until - job.startedAt) / 1000),
    sentences: job.sentences,
    savedTo: job.savedTo,
    error: job.error,
    // Only ship the (large) lesson once the job is done.
    lesson: job.status === "done" ? job.lesson : undefined,
  };
}

function sweepJobs() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (job.finishedAt && now - job.finishedAt > JOB_TTL_MS) jobs.delete(id);
  }
}
setInterval(sweepJobs, 60_000).unref();

// ─── Job launcher ────────────────────────────────────────────────────────────
// Pages are accepted instantly (image + status stashed on disk) and each one
// launches its own pipeline immediately — no serial queue. The work is
// network-bound (`claude -p` barely touches local CPU), so the laptop isn't the
// limit; Claude-side rate limits are, and those are handled with backoff in
// runClaudeWithBackoff(). Set MAX_CONCURRENCY to bound parallel pages anyway
// (excess pages then wait as "queued", exactly like the old pool).
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY) || Infinity;
let active = 0;
const queue = [];

function enqueueJob(item) {
  queue.push(item);
  pump();
}
function pump() {
  while (active < MAX_CONCURRENCY && queue.length) {
    const item = queue.shift();
    active++;
    processJob(item).finally(() => {
      active--;
      pump();
    });
  }
}

// ─── Terminal dashboard ──────────────────────────────────────────────────────
// A live block at the bottom of the terminal: one row per in-flight page, ticking
// every second. Log lines scroll above it (log() clears and repaints the block).
// TTY only — when output is piped or backgrounded, the tagged logs stand alone.
let dashRows = 0;
function clearDash() {
  if (!process.stdout.isTTY || !dashRows) return;
  process.stdout.write(`\x1b[${dashRows}A\x1b[J`); // up N rows, erase to end
  dashRows = 0;
}
function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}
function dashStage(j) {
  if (j.status === "pending") return "queued";
  if (j.stage === "transcribe") return "transcribing";
  if (j.stage === "enrich") {
    return j.chunkTotal > 1 ? `enriching ${j.chunkDone}/${j.chunkTotal} chunks` : "enriching";
  }
  if (j.stage === "narrate") {
    return j.chunkTotal ? `♪ narrating ${j.chunkDone}/${j.chunkTotal}` : "♪ narrating (loading model)";
  }
  return "starting";
}
function buildDashRows() {
  const live = [...jobs.values()].filter((j) => j.status === "pending" || j.status === "running");
  if (!live.length) return [];
  const rows = [`  ── ${live.length} active job${live.length === 1 ? "" : "s"} ${"─".repeat(40)}`];
  for (const j of live) {
    const chars = j.chars ? `  ${(j.chars / 1000).toFixed(1)}k chars` : "";
    rows.push(
      `  ${safeBookName(j.book)} p${j.page}  ▸ ${dashStage(j)}  ${fmtElapsed(Date.now() - j.startedAt)}${chars}`,
    );
  }
  return rows;
}
function renderDash() {
  if (!process.stdout.isTTY) return;
  clearDash();
  const rows = buildDashRows();
  if (!rows.length) return;
  process.stdout.write(rows.join("\n") + "\n");
  dashRows = rows.length;
}
setInterval(renderDash, 1000).unref();

// Serialize per-book page allocation so rapid successive scans get distinct
// Page<N> numbers (page 2 and page 3, never page 2 twice).
const bookLocks = new Map();
function withBookLock(book, fn) {
  const key = safeBookName(book);
  const prev = bookLocks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  bookLocks.set(
    key,
    next.then(
      () => {},
      () => {},
    ),
  );
  return next;
}

// Allocate the next page, then immediately persist the image + a "queued" status
// so the work is durable the instant it arrives — and resumable after a crash.
async function reserveAndStash(book, base64, model, langs, explicitPage) {
  return withBookLock(book, async () => {
    // Use the page number the user labelled this upload with (matches the book);
    // fall back to auto-increment only when none was given.
    const page = Number(explicitPage) > 0 ? Number(explicitPage) : await nextPageNumber(book);
    const dir = path.join(PROJECTS_DIR, safeBookName(book), `Page${page}`);
    await fs.mkdir(dir, { recursive: true });
    // Fresh scan of this page → clear stale derived artifacts so it fully
    // re-processes from this new image (don't resume an old transcript).
    await Promise.all(
      ["transcript.json", "native.txt", "lesson.json", "page.html"].map((f) =>
        fs.rm(path.join(dir, f), { force: true }).catch(() => {}),
      ),
    );
    await fs.rm(path.join(dir, "audio"), { recursive: true, force: true }).catch(() => {});
    await fs.writeFile(path.join(dir, "source.jpg"), Buffer.from(base64, "base64"));
    await writeStatus(book, page, {
      status: "queued",
      page,
      book: bookLabel(book),
      model: model || null,
      sourceLanguage: langs.sourceLanguage || null,
      targetLanguage: langs.targetLanguage || null,
      queuedAt: Date.now(),
    });
    return page;
  });
}

// On startup, re-enqueue any page that was stashed but never finished (has a
// source.jpg + queued/processing status but no lesson.json). The image and
// languages live in the page folder, so an interrupted job just resumes.
async function recoverPending() {
  let books;
  try {
    books = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  } catch {
    return; // no projects dir yet
  }
  let recovered = 0;
  for (const b of books) {
    if (!b.isDirectory()) continue;
    const bookDir = path.join(PROJECTS_DIR, b.name);
    let entries;
    try {
      entries = await fs.readdir(bookDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const p of entries) {
      const m = p.isDirectory() && p.name.match(/^Page(\d+)$/);
      if (!m) continue;
      const pdir = path.join(bookDir, p.name);
      try {
        await fs.access(path.join(pdir, "lesson.json"));
        continue; // already finished
      } catch {
        /* no lesson yet — candidate for recovery */
      }
      let st;
      try {
        st = JSON.parse(await fs.readFile(path.join(pdir, "status.json"), "utf8"));
      } catch {
        continue;
      }
      // Resume queued/processing pages, and errored pages too (a stage-2 timeout
      // is transient — the saved transcript makes the retry cheap). Done pages
      // are already skipped above (they have a lesson.json).
      if (!["queued", "processing", "error"].includes(st.status)) continue;
      // Resume from the furthest stage reached: a saved transcript means stage 2
      // only (no image needed); otherwise re-run from the source image.
      const hasTranscript = await fs
        .access(path.join(pdir, "transcript.json"))
        .then(() => true, () => false);
      let base64;
      try {
        base64 = (await fs.readFile(path.join(pdir, "source.jpg"))).toString("base64");
      } catch {
        base64 = undefined;
      }
      if (!hasTranscript && !base64) continue; // nothing to resume from
      const { id } = createJob({ book: st.book || b.name, page: Number(m[1]) });
      enqueueJob({
        id,
        image: base64,
        model: st.model || undefined,
        langs: { sourceLanguage: st.sourceLanguage, targetLanguage: st.targetLanguage },
      });
      recovered++;
    }
  }
  if (recovered) log(`↻ recovered ${recovered} unfinished page${recovered === 1 ? "" : "s"} from disk`);
}

// ─── Claude Code runner ─────────────────────────────────────────────────────
// Streams events (stream-json + partial messages) so we can report live
// progress. `report(phase, meta?)` is called as the model moves through
// reading → thinking → writing; meta.chars carries the running output size for
// the dashboard. `tag` (e.g. "[Otje p16]") attributes log lines to their job.
function runClaude(prompt, model, cwd, report, tag = "") {
  return new Promise((resolve, reject) => {
    const alias = MODEL_ALIAS[model] || "sonnet";
    const args = [
      "-p",
      prompt,
      "--allowedTools",
      "Read",
      "--dangerously-skip-permissions",
      "--output-format",
      "stream-json",
      "--include-partial-messages",
      "--verbose",
      "--effort",
      EFFORT,
      "--model",
      alias,
    ];
    const t0 = Date.now();
    report(`Claude starting (model=${alias})…`);

    const child = spawn("claude", args, { cwd });
    let buf = "";
    let stderr = "";
    let resultText = null; // from the final `result` event
    let assistantText = ""; // fallback: accumulated text deltas
    let chars = 0;
    let lastCharReport = 0;
    let firstEventAt = 0; // CLI emitted its first stream event (startup done)
    let firstThinkAt = 0; // first thinking token
    let firstTextAt = 0; // first output (JSON) token

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      log(`${tag} claude timed out after ${CLAUDE_TIMEOUT_MS / 1000}s — killed`);
      reject(new Error("Claude Code timed out."));
    }, CLAUDE_TIMEOUT_MS);

    function handleEvent(evt) {
      if (!evt || typeof evt !== "object") return;
      if (!firstEventAt) firstEventAt = Date.now();
      if (evt.type === "system" && evt.subtype === "init") {
        report("Reading the page image…");
      } else if (evt.type === "stream_event" && evt.event) {
        const e = evt.event;
        if (e.type === "content_block_start" && e.content_block) {
          const t = e.content_block.type;
          if (t === "tool_use") report("Reading the page image…");
          else if (t === "thinking") {
            if (!firstThinkAt) firstThinkAt = Date.now();
            report("Thinking…");
          } else if (t === "text") {
            if (!firstTextAt) firstTextAt = Date.now();
            report("Writing the lesson…");
          }
        } else if (e.type === "content_block_delta" && e.delta) {
          if (e.delta.type === "text_delta") {
            if (!firstTextAt) firstTextAt = Date.now();
            const txt = e.delta.text || "";
            assistantText += txt;
            chars += txt.length;
            if (chars - lastCharReport >= 250) {
              lastCharReport = chars;
              report("Writing the lesson…", { chars });
            }
          } else if (e.delta.type === "thinking_delta") {
            if (!firstThinkAt) firstThinkAt = Date.now();
            report("Thinking…");
          }
        }
      } else if (evt.type === "result") {
        if (typeof evt.result === "string") resultText = evt.result;
      }
    }

    function drain() {
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          handleEvent(JSON.parse(line));
        } catch {
          /* ignore non-JSON lines */
        }
      }
    }

    child.stdout.on("data", (d) => {
      buf += d;
      drain();
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (err) => {
      clearTimeout(timer);
      if (err.code === "ENOENT") {
        reject(new Error("`claude` CLI not found on PATH. Is Claude Code installed?"));
      } else {
        reject(err);
      }
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      buf += "\n";
      drain();
      // Per-phase breakdown so you can see where the time actually goes.
      const end = Date.now();
      const total = end - t0;
      const startup = (firstEventAt || end) - t0;
      const firstOut = firstTextAt || end;
      const analyze = Math.max(0, firstOut - (firstEventAt || t0)); // vision + thinking
      const generate = Math.max(0, end - firstOut); // emitting the JSON
      const pct = (x) => (total ? Math.round((x / total) * 100) : 0);
      const s = (x) => (x / 1000).toFixed(1);
      log(`${tag} claude finished in ${s(total)}s (exit ${code})`);
      log(
        `${tag} ⏱ startup ${s(startup)}s (${pct(startup)}%) · read+think ${s(analyze)}s (${pct(analyze)}%) · write ${s(generate)}s (${pct(generate)}%) · ${chars} chars out`,
      );
      if (code !== 0) {
        reject(new Error(stderr.trim() || `claude exited with code ${code}`));
        return;
      }
      const out = resultText ?? assistantText;
      if (!out) {
        reject(new Error("Claude Code returned no output."));
        return;
      }
      resolve(out);
    });
  });
}

// Pull a JSON object out of a model reply that may include fences or prose.
function parseModelJson(text) {
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

// Validators (mutate to fill pageTitle, then return the object).
function validateLesson(lesson) {
  if (!lesson || !Array.isArray(lesson.paragraphs)) {
    throw new Error("Reply was not in the expected lesson shape.");
  }
  if (!("pageTitle" in lesson)) lesson.pageTitle = null;
  return lesson;
}
function validateTranscript(t) {
  if (!t || !Array.isArray(t.paragraphs)) {
    throw new Error("Transcript was not in the expected shape.");
  }
  if (!("pageTitle" in t)) t.pageTitle = null;
  if (typeof t.pageNumber !== "number") t.pageNumber = null;
  return t;
}

// Human-readable source text from a transcript ({paragraphs: [[sentences]]}).
function transcriptText(t) {
  return (
    t.paragraphs.map((p) => (Array.isArray(p) ? p.join(" ") : String(p))).join("\n\n") + "\n"
  );
}
function countSentences(t) {
  return t.paragraphs.reduce((a, p) => a + (Array.isArray(p) ? p.length : 0), 0);
}

// A throwaway working dir for one `claude -p` run (holds page.jpg if given).
async function stashTemp(base64) {
  const dir = path.join(os.tmpdir(), `ereader-${randomBytes(6).toString("hex")}`);
  await fs.mkdir(dir, { recursive: true });
  if (base64) await fs.writeFile(path.join(dir, "page.jpg"), Buffer.from(base64, "base64"));
  return dir;
}

// Claude-side throttling surfaces as an error string. With unbounded parallel
// launches that's an expected condition, not a failure — back off and retry the
// stage instead of erroring the whole page.
const RATE_LIMIT_RE = /rate.?limit|overloaded|429|too many (?:requests|concurrent)|usage limit|capacity/i;
const BACKOFF_MS = [15_000, 30_000, 60_000];
async function runClaudeWithBackoff(prompt, model, dir, report, tag) {
  for (let i = 0; ; i++) {
    try {
      return await runClaude(prompt, model, dir, report, tag);
    } catch (e) {
      if (i >= BACKOFF_MS.length || !RATE_LIMIT_RE.test(String(e?.message))) throw e;
      const sec = BACKOFF_MS[i] / 1000;
      report(`Rate-limited — retrying in ${sec}s…`);
      log(`${tag} rate-limited — backing off ${sec}s (retry ${i + 1}/${BACKOFF_MS.length})`);
      await new Promise((r) => setTimeout(r, BACKOFF_MS[i]));
    }
  }
}

// Stage-2 fan-out: group the transcript's paragraphs into chunks of roughly
// CHUNK_SENTENCES sentences (paragraphs stay intact) so one page's enrichment
// runs as parallel claude calls instead of one long serial generation.
const CHUNK_SENTENCES = Number(process.env.CHUNK_SENTENCES) || 10;
function chunkTranscript(t) {
  const chunks = [];
  let cur = [];
  let n = 0;
  for (const p of t.paragraphs) {
    const len = Array.isArray(p) ? p.length : 1;
    if (cur.length && n + len > CHUNK_SENTENCES) {
      chunks.push(cur);
      cur = [];
      n = 0;
    }
    cur.push(p);
    n += len;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

// Run claude once, parse + validate the JSON, retry once with a stricter nudge.
async function runClaudeJson(promptBase, model, dir, report, validate, tag = "") {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt === 1) {
      report("Reply wasn't valid JSON — retrying…");
      log(`${tag} reply wasn't valid JSON — retrying with a stricter nudge`);
    }
    const prompt =
      attempt === 0
        ? promptBase
        : promptBase + "\n\nIMPORTANT: Return ONLY raw minified JSON. No prose, no markdown.";
    const reply = await runClaudeWithBackoff(prompt, model, dir, report, tag);
    try {
      return validate(parseModelJson(reply));
    } catch (e) {
      if (attempt === 1) throw e;
    }
  }
  throw new Error("No valid output produced.");
}

// ─── Narrator (stage 3, separate job) ────────────────────────────────────────
// After a lesson is committed, a narrate job synthesizes one audio file per
// sentence with Chatterbox Multilingual TTS (local, open-source) into
// projects/<book>/Page<N>/audio/. Needs the one-time setup:
//     sh bridge/setup-narrator.sh
// Runs one page at a time (the model holds a few GB of memory); pages queue.
// Drop a voice-ref.wav in bridge/ to clone that voice as the narrator.
const NARRATOR_PY = path.join(BRIDGE_DIR, ".venv-narrator", "bin", "python");
const NARRATE_SCRIPT = path.join(BRIDGE_DIR, "narrate.py");
// Idle (not total) timeout: killed only if no sentence completes for this long.
// Generous because the first run downloads the model weights.
const NARRATE_IDLE_TIMEOUT_MS = Number(process.env.NARRATE_IDLE_TIMEOUT_MS) || 20 * 60_000;
const NARRATE_CONCURRENCY = Number(process.env.NARRATE_CONCURRENCY) || 1;

// Language names (as the app sends them) → Chatterbox ISO ids.
const TTS_LANG = {
  arabic: "ar", danish: "da", german: "de", greek: "el", english: "en",
  spanish: "es", finnish: "fi", french: "fr", hebrew: "he", hindi: "hi",
  italian: "it", japanese: "ja", korean: "ko", malay: "ms", dutch: "nl",
  norwegian: "no", polish: "pl", portuguese: "pt", russian: "ru", swedish: "sv",
  swahili: "sw", turkish: "tr", chinese: "zh",
};

let narratorAvailable = null; // lazily checked once
async function checkNarrator() {
  if (narratorAvailable === null) {
    narratorAvailable = await fs.access(NARRATOR_PY).then(() => true, () => false);
  }
  return narratorAvailable;
}

// Merge a patch into a page's status.json without clobbering other fields.
async function patchStatus(book, page, patch) {
  const file = path.join(PROJECTS_DIR, safeBookName(book), `Page${page}`, "status.json");
  let st = {};
  try {
    st = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    /* start fresh */
  }
  await fs.writeFile(file, JSON.stringify({ ...st, ...patch }, null, 2) + "\n", "utf8").catch(() => {});
}

let narrateActive = 0;
const narrateQueue = [];
function queueNarration(book, page) {
  (async () => {
    if (!(await checkNarrator())) {
      if (!queueNarration.hinted) {
        queueNarration.hinted = true;
        log(`♪ narrator not set up — run "sh bridge/setup-narrator.sh" to enable local audio`);
      }
      return;
    }
    // Skip duplicates already queued for the same page.
    const dup = narrateQueue.some((q) => q.book === book && q.page === page);
    if (dup) return;
    narrateQueue.push({ book, page });
    pumpNarrate();
  })().catch(() => {});
}
function pumpNarrate() {
  while (narrateActive < NARRATE_CONCURRENCY && narrateQueue.length) {
    const item = narrateQueue.shift();
    narrateActive++;
    runNarration(item).finally(() => {
      narrateActive--;
      pumpNarrate();
    });
  }
}

async function runNarration({ book, page }) {
  const tag = `[${safeBookName(book)} p${page}] ♪`;
  const pageDir = path.join(PROJECTS_DIR, safeBookName(book), `Page${page}`);
  const lessonFile = path.join(pageDir, "lesson.json");
  if (!(await fs.access(lessonFile).then(() => true, () => false))) {
    log(`${tag} no lesson.json — skipping narration`);
    return;
  }
  // Pick the TTS language from the page's recorded source language.
  let langName = "dutch";
  try {
    const st = JSON.parse(await fs.readFile(path.join(pageDir, "status.json"), "utf8"));
    if (st.sourceLanguage) langName = String(st.sourceLanguage).toLowerCase();
  } catch {
    /* default */
  }
  const lang = TTS_LANG[langName] || "nl";

  const { job } = createJob({ book, page });
  job.status = "running";
  job.stage = "narrate";
  const t0 = Date.now();
  await patchStatus(book, page, { audio: "generating" });
  log(`${tag} narrating (lang=${lang})…`);

  try {
    await new Promise((resolve, reject) => {
      const child = spawn(NARRATOR_PY, [NARRATE_SCRIPT, "--lesson", lessonFile, "--out", path.join(pageDir, "audio"), "--lang", lang]);
      let stderr = "";
      let buf = "";
      let timer;
      const armTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          child.kill("SIGKILL");
          reject(new Error(`narrator made no progress for ${NARRATE_IDLE_TIMEOUT_MS / 60000} min`));
        }, NARRATE_IDLE_TIMEOUT_MS);
      };
      armTimer();
      child.stdout.on("data", (d) => {
        buf += d;
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          armTimer();
          try {
            const evt = JSON.parse(line);
            if (evt.loading) log(`${tag} loading TTS model… (first run downloads the weights)`);
            if (evt.total != null) job.chunkTotal = evt.total;
            if (evt.done != null) job.chunkDone = evt.done;
          } catch {
            /* ignore non-JSON lines */
          }
        }
      });
      child.stderr.on("data", (d) => (stderr += d));
      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(stderr.trim().split("\n").pop() || `narrator exited with code ${code}`));
      });
    });
    await patchStatus(book, page, { audio: "done" });
    job.status = "done";
    job.phase = "Done";
    job.finishedAt = Date.now();
    log(`✓ ${tag} ${job.chunkTotal || 0} sentences narrated in ${Math.round((Date.now() - t0) / 1000)}s`);
  } catch (e) {
    await patchStatus(book, page, { audio: "error", audioError: e.message });
    job.status = "error";
    job.error = e.message;
    job.finishedAt = Date.now();
    log(`✗ ${tag} narration failed: ${e.message}`);
  }
}

// Read a previously-committed transcript (used to resume at stage 2).
async function readTranscript(pageDir) {
  try {
    return validateTranscript(JSON.parse(await fs.readFile(path.join(pageDir, "transcript.json"), "utf8")));
  } catch {
    return null;
  }
}

// Run a job in the background, updating its status as it goes.
async function processJob({ id, image, model, langs }) {
  const job = jobs.get(id);
  if (!job) return;
  const short = id.slice(0, 8);
  const tag = `[${safeBookName(job.book)} p${job.page}]`;
  let lastLogged = "";
  // Reporter factory. Stage 1 passes chunkChars=null; stage-2 chunks share one
  // chunkChars array so the phone-facing phase and the dashboard both show the
  // aggregate char count across all parallel chunks. Char ticks update state
  // only — the 1s dashboard repaint shows them without flooding the log.
  const makeReport = (chunkChars, chunkIdx) => (phase, meta = {}) => {
    if (meta.chars != null) {
      if (chunkChars) {
        chunkChars[chunkIdx] = meta.chars;
        job.chars = chunkChars.reduce((a, b) => a + (b || 0), 0);
      } else {
        job.chars = meta.chars;
      }
      job.phase = `Writing the lesson… (${job.chars} chars)`;
      return;
    }
    job.phase = phase;
    if (phase === lastLogged) return; // identical phases (e.g. "Thinking…") log once
    lastLogged = phase;
    log(`${tag} ${phase}`);
  };
  const report = makeReport(null, 0);
  // Stamp durable status, carrying enough to resume after a restart.
  let detectedPage = null; // printed page number the model read off the page
  const stamp = (extra) =>
    writeStatus(job.book, job.page, {
      page: job.page,
      book: job.book,
      model: model || null,
      sourceLanguage: langs?.sourceLanguage || null,
      targetLanguage: langs?.targetLanguage || null,
      detectedPage,
      ...extra,
    }).catch(() => {});
  const pageDir = path.join(PROJECTS_DIR, safeBookName(job.book), `Page${job.page}`);
  const t0 = Date.now();
  job.status = "running";
  try {
    // ── Stage 1: transcribe → commit native.txt + transcript.json ─────────────
    let transcript = await readTranscript(pageDir); // present → resume at stage 2
    if (transcript) {
      report("Resuming from saved transcript…");
      log(`${tag} ↻ transcript already saved — resuming at stage 2`);
    } else {
      if (!image) throw new Error("No image available to transcribe.");
      job.stage = "transcribe";
      await stamp({ status: "processing", stage: "transcribing", startedAt: Date.now() });
      report("Reading the page…");
      const tmp = await stashTemp(image);
      try {
        transcript = await runClaudeJson(
          transcribePrompt(langs?.sourceLanguage),
          model,
          tmp,
          report,
          validateTranscript,
          tag,
        );
      } finally {
        fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
      }
      // Commit stage 1 — durable the moment transcription finishes.
      await fs.writeFile(path.join(pageDir, "transcript.json"), JSON.stringify(transcript) + "\n", "utf8");
      await fs.writeFile(path.join(pageDir, "native.txt"), transcriptText(transcript), "utf8");
      await stamp({ status: "processing", stage: "transcribed", sentences: countSentences(transcript) });
      log(`${tag} ✓ stage 1: ${countSentences(transcript)} sentences — native.txt saved (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }

    // ── Stage 2: enrich in parallel chunks → commit lesson.json + page.html ───
    detectedPage = transcript.pageNumber ?? null; // surface what was printed on the page
    job.stage = "enrich";
    job.chars = 0;
    await stamp({ status: "processing", stage: "enriching" });
    report("Writing the lesson…");
    const chunks = chunkTranscript(transcript);
    job.chunkTotal = chunks.length;
    const chunkChars = new Array(chunks.length).fill(0);
    if (chunks.length > 1) log(`${tag} stage 2: fanning out into ${chunks.length} parallel chunks`);
    const parts = await Promise.all(
      chunks.map(async (paragraphs, i) => {
        const tmp2 = await stashTemp(null); // text-only, no image needed
        try {
          const part = await runClaudeJson(
            enrichPrompt(
              langs?.sourceLanguage,
              langs?.targetLanguage,
              { pageTitle: i === 0 ? transcript.pageTitle ?? null : null, paragraphs },
              chunks.length > 1,
            ),
            model,
            tmp2,
            makeReport(chunkChars, i),
            validateLesson,
            tag,
          );
          job.chunkDone++;
          if (chunks.length > 1) log(`${tag} ✓ chunk ${i + 1}/${chunks.length} done`);
          return part;
        } finally {
          fs.rm(tmp2, { recursive: true, force: true }).catch(() => {});
        }
      }),
    );
    const lesson = {
      pageTitle: parts[0]?.pageTitle ?? null,
      paragraphs: parts.flatMap((p) => p.paragraphs),
    };
    if (lesson.pageTitle == null && transcript.pageTitle != null) lesson.pageTitle = transcript.pageTitle;

    await fs.writeFile(path.join(pageDir, "lesson.json"), JSON.stringify(lesson, null, 2) + "\n", "utf8");
    await fs.writeFile(path.join(pageDir, "page.html"), renderLessonHtml(lesson, job.book, job.page), "utf8");
    await rebuildIndex(job.book).catch(() => {});

    const n = lesson.paragraphs.reduce((a, p) => a + (p.sentences?.length || 0), 0);
    job.lesson = lesson;
    job.sentences = n;
    job.savedTo = path.relative(REPO_ROOT, pageDir);
    await stamp({ status: "done", stage: "done", sentences: n, finishedAt: Date.now() });
    job.phase = "Done";
    job.status = "done";
    job.finishedAt = Date.now();
    log(`✓ ${tag} job ${short} done: ${n} sentences in ${Math.round((Date.now() - t0) / 1000)}s`);
    queueNarration(job.book, job.page); // stage 3: local audio, as its own job
  } catch (e) {
    job.error = e.message || "Failed to produce lesson.";
    job.phase = "Error";
    job.status = "error";
    job.finishedAt = Date.now();
    await stamp({ status: "error", error: job.error, finishedAt: Date.now() });
    log(`✗ ${tag} job ${short} error: ${job.error}`);
  }
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});

  if (req.method === "GET" && req.url === "/health") {
    log(`✓ test connection from ${req.socket.remoteAddress}`);
    return send(res, 200, { ok: true, service: "ereader-bridge" });
  }

  // Poll a job's progress / result.
  if (req.method === "GET" && req.url.startsWith("/job/")) {
    const id = decodeURIComponent(req.url.slice("/job/".length));
    const job = jobs.get(id);
    if (!job) return send(res, 404, { error: "Unknown or expired job." });
    return send(res, 200, jobView(job));
  }

  // Audio manifest for a page (404 until narration has finished).
  if (req.method === "GET" && req.url.match(/^\/books\/.+\/pages\/\d+\/audio$/)) {
    const mm = decodeURIComponent(req.url).match(/^\/books\/(.+)\/pages\/(\d+)\/audio$/);
    const file = path.join(PROJECTS_DIR, safeBookName(mm[1]), `Page${Number(mm[2])}`, "audio", "manifest.json");
    (async () => {
      try {
        send(res, 200, JSON.parse(await fs.readFile(file, "utf8")));
      } catch {
        send(res, 404, { error: "No audio for that page yet." });
      }
    })().catch((e) => send(res, 500, { error: e.message }));
    return;
  }

  // One sentence's audio file, e.g. /books/Otje/pages/16/audio/pg2_s1.mp3
  if (req.method === "GET" && req.url.match(/^\/books\/.+\/pages\/\d+\/audio\/[A-Za-z0-9._-]+$/)) {
    const mm = decodeURIComponent(req.url).match(/^\/books\/(.+)\/pages\/(\d+)\/audio\/([A-Za-z0-9._-]+)$/);
    const name = path.basename(mm[3]); // already character-restricted by the route match
    const file = path.join(PROJECTS_DIR, safeBookName(mm[1]), `Page${Number(mm[2])}`, "audio", name);
    (async () => {
      try {
        const buf = await fs.readFile(file);
        res.writeHead(200, {
          "content-type": name.endsWith(".wav") ? "audio/wav" : "audio/mpeg",
          "content-length": buf.length,
          "access-control-allow-origin": "*",
          "cache-control": "max-age=86400",
        });
        res.end(buf);
      } catch {
        send(res, 404, { error: "No such audio file." });
      }
    })().catch((e) => send(res, 500, { error: e.message }));
    return;
  }

  // Generate (or resume) narration for an existing page — backfill for pages
  // scanned before the narrator existed. No-op queue if audio is complete:
  // the worker skips files that already exist.
  if (req.method === "POST" && req.url.match(/^\/books\/.+\/pages\/\d+\/narrate$/)) {
    const mm = decodeURIComponent(req.url).match(/^\/books\/(.+)\/pages\/(\d+)\/narrate$/);
    (async () => {
      if (!(await checkNarrator())) {
        return send(res, 503, { error: 'Narrator not set up. Run "sh bridge/setup-narrator.sh" on the laptop.' });
      }
      const lesson = path.join(PROJECTS_DIR, safeBookName(mm[1]), `Page${Number(mm[2])}`, "lesson.json");
      if (!(await fs.access(lesson).then(() => true, () => false))) {
        return send(res, 404, { error: "That page has no lesson yet." });
      }
      queueNarration(mm[1], Number(mm[2]));
      send(res, 202, { ok: true });
    })().catch((e) => send(res, 500, { error: e.message }));
    return;
  }

  // Serve a page's source image so the reader can show the artwork.
  if (req.method === "GET" && req.url.match(/^\/books\/.+\/pages\/\d+\/image$/)) {
    const mm = decodeURIComponent(req.url).match(/^\/books\/(.+)\/pages\/(\d+)\/image$/);
    const file = path.join(PROJECTS_DIR, safeBookName(mm[1]), `Page${Number(mm[2])}`, "source.jpg");
    (async () => {
      try {
        const buf = await fs.readFile(file);
        res.writeHead(200, {
          "content-type": "image/jpeg",
          "content-length": buf.length,
          "access-control-allow-origin": "*",
          "cache-control": "no-cache",
        });
        res.end(buf);
      } catch {
        send(res, 404, { error: "No image for that page." });
      }
    })().catch((e) => send(res, 500, { error: e.message }));
    return;
  }

  // Sync surface: list a book's archived pages, or fetch one page's lesson.
  //   GET /books/<book>              → { book, pages: [{ page, sentences, pageTitle }] }
  //   GET /books/<book>/pages/<n>    → the LessonResult for that page
  if (req.method === "GET" && req.url.startsWith("/books/")) {
    const rest = decodeURIComponent(req.url.slice("/books/".length));
    const pageMatch = rest.match(/^(.*)\/pages\/(\d+)$/);
    (async () => {
      if (pageMatch) {
        const [, book, n] = pageMatch;
        try {
          send(res, 200, await readBookPageLesson(book, Number(n)));
        } catch {
          send(res, 404, { error: "Page not found." });
        }
      } else {
        const pages = await listBookPages(rest);
        send(res, 200, { book: safeBookName(rest), pages });
      }
    })().catch((e) => send(res, 500, { error: e.message || "Sync failed." }));
    return;
  }

  // Repair a specific page: re-enqueue it, resuming from the saved transcript if
  // present (stage 2 only, no re-OCR), else from the source image. Works on a
  // failed/partial page regardless of its current status.
  if (req.method === "POST" && req.url.match(/^\/books\/.+\/pages\/\d+\/retry$/)) {
    const mm = decodeURIComponent(req.url).match(/^\/books\/(.+)\/pages\/(\d+)\/retry$/);
    const book = mm[1];
    const page = Number(mm[2]);
    (async () => {
      const pdir = path.join(PROJECTS_DIR, safeBookName(book), `Page${page}`);
      const done = await fs.access(path.join(pdir, "lesson.json")).then(() => true, () => false);
      if (done) return send(res, 200, { ok: true, alreadyDone: true, page });
      const hasTranscript = await fs
        .access(path.join(pdir, "transcript.json"))
        .then(() => true, () => false);
      let base64;
      try {
        base64 = (await fs.readFile(path.join(pdir, "source.jpg"))).toString("base64");
      } catch {
        base64 = undefined;
      }
      if (!hasTranscript && !base64) {
        return send(res, 404, { error: "Nothing to retry — no transcript or image on disk." });
      }
      let st = {};
      try {
        st = JSON.parse(await fs.readFile(path.join(pdir, "status.json"), "utf8"));
      } catch {
        /* fall back to no model/langs */
      }
      const { id } = createJob({ book, page });
      log(`↻ retry requested for "${safeBookName(book)}" page ${page} (${hasTranscript ? "from transcript" : "from image"})`);
      enqueueJob({
        id,
        image: base64,
        model: st.model || undefined,
        langs: { sourceLanguage: st.sourceLanguage, targetLanguage: st.targetLanguage },
      });
      send(res, 202, { ok: true, jobId: id, page });
    })().catch((e) => send(res, 500, { error: e.message || "Retry failed." }));
    return;
  }

  // Re-label a page: rename Page<old> → Page<new> so the folder matches the book.
  if (req.method === "POST" && req.url.match(/^\/books\/.+\/pages\/\d+\/relabel$/)) {
    const mm = decodeURIComponent(req.url).match(/^\/books\/(.+)\/pages\/(\d+)\/relabel$/);
    const book = mm[1];
    const oldPage = Number(mm[2]);
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      (async () => {
        const newPage = Number(JSON.parse(body || "{}").newPage);
        if (!(newPage > 0)) return send(res, 400, { error: "newPage must be a positive integer." });
        const baseDir = path.join(PROJECTS_DIR, safeBookName(book));
        const src = path.join(baseDir, `Page${oldPage}`);
        const dst = path.join(baseDir, `Page${newPage}`);
        if (newPage === oldPage) return send(res, 200, { ok: true, from: oldPage, to: newPage });
        if (!(await fs.access(src).then(() => true, () => false))) {
          return send(res, 404, { error: `Page ${oldPage} not found on the bridge.` });
        }
        if (await fs.access(dst).then(() => true, () => false)) {
          return send(res, 409, { error: `Page ${newPage} already exists.` });
        }
        await fs.rename(src, dst);
        // Keep status.json + page.html in sync with the new number.
        try {
          const st = JSON.parse(await fs.readFile(path.join(dst, "status.json"), "utf8"));
          st.page = newPage;
          await fs.writeFile(path.join(dst, "status.json"), JSON.stringify(st, null, 2) + "\n", "utf8");
        } catch {
          /* no status.json — fine */
        }
        try {
          const lesson = JSON.parse(await fs.readFile(path.join(dst, "lesson.json"), "utf8"));
          await fs.writeFile(path.join(dst, "page.html"), renderLessonHtml(lesson, bookLabel(book), newPage), "utf8");
        } catch {
          /* not enriched yet — page.html will be written with the right number later */
        }
        await rebuildIndex(book).catch(() => {});
        log(`✎ relabeled "${safeBookName(book)}" page ${oldPage} → ${newPage}`);
        send(res, 200, { ok: true, from: oldPage, to: newPage });
      })().catch((e) => send(res, 500, { error: e.message || "Relabel failed." }));
    });
    return;
  }

  // Rebuild a book's index.html (called when the app marks a book complete).
  if (req.method === "POST" && req.url.match(/^\/books\/.+\/index$/)) {
    const book = decodeURIComponent(req.url.slice("/books/".length, -"/index".length));
    (async () => {
      const { count } = await rebuildIndex(book);
      log(`📑 rebuilt index for "${safeBookName(book)}" (${count} pages)`);
      send(res, 200, { ok: true, book: safeBookName(book), pages: count });
    })().catch((e) => send(res, 500, { error: e.message || "Index build failed." }));
    return;
  }

  // Submit a page. Returns a jobId immediately; processing runs in the background.
  if (req.method === "POST" && req.url === "/lesson") {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        send(res, 413, { error: "Image too large." });
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", async () => {
      try {
        const { image, model, book, page, sourceLanguage, targetLanguage } = JSON.parse(
          Buffer.concat(chunks).toString(),
        );
        if (!image) return send(res, 400, { error: "Missing image." });
        const kb = Math.round((image.length * 3) / 4 / 1024); // base64 → bytes
        const langs = { sourceLanguage, targetLanguage };
        // Use the labelled page number if given (atomic auto-allocate otherwise);
        // stash image + status upfront so the work is durable/resumable instantly.
        const pageNum = await reserveAndStash(book, image, model, langs, page);
        const { id } = createJob({ book, page: pageNum });
        log(
          `📄 page received from ${req.socket.remoteAddress} (${kb} KB, model=${model || "default"}) ` +
            `book="${safeBookName(book)}" page=${pageNum} → job ${id.slice(0, 8)} ` +
            `(in flight: ${active + queue.length + 1})`,
        );
        enqueueJob({ id, image, model, langs }); // launches immediately (no cap unless MAX_CONCURRENCY set)
        return send(res, 202, { jobId: id, page: pageNum });
      } catch (e) {
        log(`✗ bad /lesson request: ${e.message}`);
        return send(res, 400, { error: "Invalid request body." });
      }
    });
    return;
  }

  send(res, 404, { error: "Not found." });
});

server.listen(PORT, "0.0.0.0", () => {
  const urls = lanUrls();
  console.log("\n  EReader Tutor — Claude Code bridge (Max plan)\n");
  console.log("  Running. Paste one of these into the app:");
  console.log("  Settings → Translation source → Local Claude Code (Max)\n");
  if (urls.length) urls.forEach((u) => console.log("    " + u));
  else console.log("    http://localhost:" + PORT + "  (no LAN address found)");
  console.log("\n  Keep this window open while you scan. Ctrl+C to stop.\n");
  recoverPending().catch(() => {}); // resume any pages interrupted by a restart
});
