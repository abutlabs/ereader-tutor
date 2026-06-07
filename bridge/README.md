# Claude Code bridge (Max plan)

Run lessons through your **Claude Max** subscription instead of paid API credits.
The phone app sends a page photo to this little server on your laptop, which runs
**Claude Code headless** (`claude -p`) — authenticated by your Max plan — to read
the image and build the structured lesson.

No API key. No per-token billing. Draws on your Max usage limits.

## Requirements
- The `claude` CLI installed and signed in (i.e. Claude Code already works in
  your terminal).
- Node.js (any recent version).
- Phone and laptop on the **same Wi-Fi**.

## Run it
From the project root (or from `bridge/`):

```bash
node bridge/server.mjs
```

It prints a URL like `http://192.168.1.20:8788`. In the app:
**Settings → Translation source → Local Claude Code (Max)** → paste that URL →
**Save & test connection**. Then scan as usual.

Keep the terminal window open while you scan. `Ctrl+C` to stop.

> **The IP can change** when you reconnect to Wi-Fi or switch networks. If scans
> or sync start failing, re-run the server and re-paste the printed URL in the app.
>
> **Restart after editing this server** — a running instance won't pick up code
> edits, and a stale process is the usual cause of unexpected `404`s on the
> `/books` routes. On restart it also **resumes any unfinished pages** from disk.

## Configuration (env vars)
| Var | Default | Purpose |
|-----|---------|---------|
| `PORT` | `8788` | Port to listen on. |
| `EFFORT` | `low` | Claude Code thinking/effort level (`low`…`max`). Transcribe+translate isn't a reasoning task, so `low` keeps it fast. |
| `MAX_CONCURRENCY` | `2` | How many pages process at once (each is its own `claude -p`). Extra pages wait in the queue. |
| `CLAUDE_TIMEOUT_MS` | `600000` | Per-`claude` ceiling before a run is killed. |
| `PROJECTS_DIR` | `<repo>/projects` | Where archived pages are written. Anchored to the repo root, not the cwd. |

```bash
PORT=9000 EFFORT=medium MAX_CONCURRENCY=3 node bridge/server.mjs
```

## How it works

**Fire-and-forget + a bounded worker pool.** `POST /lesson` stamps the page to
disk and returns instantly; a pool of `MAX_CONCURRENCY` workers (each its own
`claude -p` run) drains the queue. You can submit page 3 while page 2 is still
going — the phone never waits.

**Two committed stages** (so a slow/failed page never loses everything):

1. **Transcribe** — read the page, extract the source text → commit
   `native.txt` + `transcript.json`. Fast.
2. **Enrich** — translate + word-by-word + grammar notes *from the transcript*
   (text-only, no re-OCR) → commit `lesson.json` + `page.html`.

If stage 2 fails, the transcript survives and the page **resumes at stage 2** on
the next run. Progress comes from Claude Code's `--output-format stream-json
--include-partial-messages` stream; live phase + `--effort low` keep thinking
minimal.

**Page numbering.** The app labels each upload with its real book page number
(sent as `page`), which names the folder directly — so out-of-order scans and
gaps are fine, and re-scanning a number replaces it. If no number is sent the
bridge auto-increments. The transcriber also reads the **printed** page number
into `status.json` (`detectedPage`) as a cross-check. A photo of an open book
(two-page spread) is transcribed as one combined page.

## Persistence — `projects/<book>/Page<N>/`
Every page is archived to disk so the work survives the phone. The folder name is
the book's title (sanitized); `Page<N>` is the labelled book page.

```
projects/
  Otje/
    index.html         ← links every page's study page (rebuilt as pages finish)
    Page7/
      status.json      ← { status, stage, page, detectedPage, model, … } (written first)
      source.jpg       ← the page photo (written first; served to the reader)
      transcript.json  ← stage 1: source text, split into paragraphs/sentences
      native.txt       ← stage 1: human-readable source text
      lesson.json      ← stage 2: the structured lesson (source + translation + words + notes)
      page.html        ← stage 2: the formatted study page
    Page8/
      ...
```

`status.json` tracks the lifecycle: `queued → processing → done` (or `error`),
with `stage` = `transcribing → transcribed → enriching → done`.

## Endpoints
| Method & path | Purpose |
|---|---|
| `GET /health` | `{ ok: true }` — used by Settings → "Save & test connection". |
| `POST /lesson` | Submit a page `{ image, model, book, page?, sourceLanguage, targetLanguage }` → `{ jobId, page }` (202). |
| `GET /job/<id>` | Poll a job: `{ status, phase, elapsedSec, sentences?, savedTo?, lesson? }`. Kept 30 min. |
| `GET /books/<book>` | Manifest: `{ book, pages: [{ page, status, sentences, pageTitle, detectedPage }] }`. |
| `GET /books/<book>/pages/<n>` | That page's `lesson.json`. |
| `GET /books/<book>/pages/<n>/image` | That page's `source.jpg` (the reader shows the artwork). |
| `POST /books/<book>/pages/<n>/retry` | Re-process a failed/partial page (resumes from its transcript). |
| `POST /books/<book>/pages/<n>/relabel` | `{ newPage }` → rename `Page<n>` → `Page<newPage>`. |
| `POST /books/<book>/index` | Rebuild `index.html` (called when a book is marked complete). |

`<book>` is the URL-encoded book title; the bridge sanitizes it to find the folder.

> Quick check from a laptop browser: `http://localhost:8788/books/<Book>` shows
> the manifest.

## Sync, recovery, and the app
- **Sync from bridge** (book screen) pulls finished pages the phone is missing,
  imports them by their page number, and downloads each page photo for offline
  reading. It also reports pages still processing.
- **Recovery** runs on startup: any page with a `source.jpg`/`transcript.json`
  but no `lesson.json` (including ones that errored) is re-queued and resumes
  from wherever it stopped.

## Notes
- **Personal use.** This routes *your* scans through *your* Max subscription on
  *your* machine. Don't point other people's installs at your laptop — that
  shares your entitlement, which isn't allowed.
- **Reading is offline.** Only *new* scans need the laptop; processed pages
  (text + artwork) live on the phone.
- The server only enables Claude Code's `Read` tool, nothing else.
- Away from your laptop? Switch the app to **Anthropic API key** instead.
