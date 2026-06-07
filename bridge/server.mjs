// Local Claude Code bridge — lets the phone app produce lessons through your
// Claude **Max** subscription instead of paid API credits.
//
// The phone POSTs a page image here; this server runs Claude Code headless
// (`claude -p`), which is authenticated by your Max plan, to read the image and
// return the structured lesson. No API key, no per-token billing.
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
import { randomBytes } from "node:crypto";

const PORT = Number(process.env.PORT) || 8788;
const CLAUDE_TIMEOUT_MS = 180_000;
const MAX_BODY_BYTES = 25 * 1024 * 1024; // ~25MB, plenty for one JPEG

// Map the app's model ids to Claude Code aliases.
const MODEL_ALIAS = {
  "claude-opus-4-8": "opus",
  "claude-sonnet-4-6": "sonnet",
};

const TUTOR_PROMPT = `You are an expert Dutch-language tutor building study material for an A2 learner who photographs pages of a book.

Read the image file ./page.jpg in the current directory. It is a photograph of ONE page of a book in Dutch. Ignore page numbers, running headers, and illustrations.

Produce a study lesson as JSON. Split the text into paragraphs and sentences as they appear. For each sentence provide:
- dutch: the sentence in natural, MODERN, everyday Dutch. If the source uses archaic spelling or dated vocabulary, modernize it to what a Dutch speaker would say today, preserving meaning exactly.
- english: a faithful, natural English translation.
- words: a word/phrase-by-phrase breakdown in sentence order (group fixed expressions and separable verbs sensibly).
- notes: 1-4 short A2-pitched grammar/usage notes (V2 word order, separable/reflexive verbs, modal past tenses, idioms, weten vs kennen, diminutives, etc.). When you modernized an archaic phrasing, add one note titled "Origineel" briefly showing what the source said.

If the page has a chapter heading, set pageTitle to it; otherwise pageTitle is null.

Output ONLY a single JSON object, minified, with no markdown fences and no commentary. The exact shape is:
{"pageTitle": string|null, "paragraphs": [ { "sentences": [ { "dutch": string, "english": string, "words": [ {"nl": string, "en": string} ], "notes": [ {"title": string, "body": string} ] } ] } ] }`;

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

function runClaude(prompt, model, cwd) {
  return new Promise((resolve, reject) => {
    const args = [
      "-p",
      prompt,
      "--allowedTools",
      "Read",
      "--dangerously-skip-permissions",
      "--output-format",
      "json",
      "--model",
      MODEL_ALIAS[model] || "opus",
    ];
    const child = spawn("claude", args, { cwd });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Claude Code timed out."));
    }, CLAUDE_TIMEOUT_MS);

    child.stdout.on("data", (d) => (stdout += d));
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
      if (code !== 0) {
        reject(new Error(stderr.trim() || `claude exited with code ${code}`));
        return;
      }
      try {
        const env = JSON.parse(stdout);
        if (env.is_error) {
          reject(new Error(env.result || "Claude Code reported an error."));
          return;
        }
        resolve(String(env.result ?? ""));
      } catch {
        reject(new Error("Couldn't parse Claude Code output."));
      }
    });
  });
}

// Pull a JSON object out of a model reply that may include fences or prose.
function extractLesson(text) {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
  const lesson = JSON.parse(t);
  if (!Array.isArray(lesson.paragraphs)) {
    throw new Error("Reply was not in the expected lesson shape.");
  }
  if (!("pageTitle" in lesson)) lesson.pageTitle = null;
  return lesson;
}

async function produceLesson(base64, model) {
  const dir = path.join(os.tmpdir(), `ereader-${randomBytes(6).toString("hex")}`);
  await fs.mkdir(dir, { recursive: true });
  const imgPath = path.join(dir, "page.jpg");
  await fs.writeFile(imgPath, Buffer.from(base64, "base64"));
  try {
    // First attempt, then one retry with a stricter nudge if JSON is malformed.
    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt =
        attempt === 0
          ? TUTOR_PROMPT
          : TUTOR_PROMPT + "\n\nIMPORTANT: Return ONLY raw minified JSON. No prose, no markdown.";
      const reply = await runClaude(prompt, model, dir);
      try {
        return extractLesson(reply);
      } catch (e) {
        if (attempt === 1) throw e;
      }
    }
    throw new Error("No valid lesson produced.");
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
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
    return send(res, 200, { ok: true, service: "ereader-bridge" });
  }
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
        const { image, model } = JSON.parse(Buffer.concat(chunks).toString());
        if (!image) return send(res, 400, { error: "Missing image." });
        const startedAt = Date.now();
        process.stdout.write("→ producing lesson via Claude Code (Max)… ");
        const lesson = await produceLesson(image, model);
        const n = lesson.paragraphs.reduce((a, p) => a + (p.sentences?.length || 0), 0);
        console.log(`done: ${n} sentences in ${Math.round((Date.now() - startedAt) / 1000)}s`);
        send(res, 200, lesson);
      } catch (e) {
        console.log("error:", e.message);
        send(res, 500, { error: e.message || "Failed to produce lesson." });
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
});
