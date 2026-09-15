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
| `MAX_CONCURRENCY` | unbounded | How many pages process at once (each is its own `claude -p`; enrich fans out further into chunks). Unset, every page launches immediately and Claude-side rate limits pace the work via backoff. Set it (e.g. `4`) for a big PDF batch — 100 pages at once will load the laptop noticeably. Extra pages wait as "queued". |
| `CLAUDE_TIMEOUT_MS` | `600000` | Per-`claude` ceiling before a run is killed. |
| `PROJECTS_DIR` | `<repo>/projects` | Where archived pages are written. Anchored to the repo root, not the cwd. |
| `NARRATE` | `1` | Set `0` to skip local narration (stage 3) even when the narrator is installed; the app falls back to device voices. |

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
      original.json    ← (PDF --translate-to only) the PDF's own text, before translation
      figures.json     ← (PDF only) illustrations: fig<k>.jpg + which paragraph each follows
      transcript.json  ← stage 1: source text, split into paragraphs/sentences
      native.txt       ← stage 1: human-readable source text
      lesson.json      ← stage 2: the structured lesson (source + translation + words + notes)
      page.html        ← stage 2: the formatted study page
    Page8/
      ...
```

`status.json` tracks the lifecycle: `queued → processing → done` (or `error`),
with `stage` = `transcribing → transcribed → enriching → done` (PDF pages ingested
with `--translate-to` start at `extracted → translating` instead).

## Endpoints
| Method & path | Purpose |
|---|---|
| `GET /health` | `{ ok: true }` — used by Settings → "Save & test connection". |
| `POST /lesson` | Submit a page `{ image, model, book, page?, sourceLanguage, targetLanguage }` → `{ jobId, page }` (202). |
| `GET /job/<id>` | Poll a job: `{ status, phase, elapsedSec, sentences?, savedTo?, lesson? }`. Kept 30 min. |
| `GET /books/<book>` | Manifest: `{ book, pages: [{ page, status, sentences, pageTitle, detectedPage, image, figures, chapter, chapterTitle, sourceLanguage, machineTranslated }] }`. On a fresh (empty) book the app adopts `sourceLanguage` on first sync; `chapter`s become the book's table of contents. |
| `GET /books/<book>/pages/<n>` | That page's `lesson.json`. |
| `GET /books/<book>/pages/<n>/image` | That page's `source.jpg` (the reader shows the artwork). |
| `GET /books/<book>/pages/<n>/figures` | `{ figures: [{ file, afterParagraph, width, height }] }` — extracted illustrations (PDF pages). |
| `GET /books/<book>/pages/<n>/figures/<file>` | One illustration (`image/jpeg`). |
| `POST /books/<book>/pages/<n>/retry` | Re-process a failed/partial page (resumes from its transcript). |
| `POST /books/<book>/pages/<n>/relabel` | `{ newPage }` → rename `Page<n>` → `Page<newPage>`. |
| `POST /books/<book>/index` | Rebuild `index.html` (called when a book is marked complete). |

`<book>` is the URL-encoded book title; the bridge sanitizes it to find the folder.

> Quick check from a laptop browser: `http://localhost:8788/books/<Book>` shows
> the manifest.

## Ingest a PDF (no phone scanning)

For a book you own as a DRM-free PDF, skip the camera: `bridge/ingest-pdf.py`
writes page folders straight into `projects/<book>/` and the bridge picks them
up on its next start, exactly as if they had been scanned.

```bash
pip3 install pypdf pymupdf      # once; pymupdf is optional (artwork / vision mode)

python3 bridge/ingest-pdf.py book.pdf --book "Le Petit Prince" \
    --source French --target English --pages 9-40
MAX_CONCURRENCY=4 node bridge/server.mjs   # (re)start → "↻ recovered N unfinished pages"
```

Then, on the phone, create a book with **the same title** (source French, tutor
English), point Settings at the bridge, and **Sync** — lessons, page artwork,
and audio come across through the normal sync path.

- `--mode text` (default) reads the PDF's text layer here — free and instant —
  and commits stage 1 (`transcript.json` + `native.txt`), so each page costs
  only the enrich run. Lines are re-flowed into paragraphs, line-break
  hyphenation is repaired (real hyphenated words like *Middle-earth* are kept),
  a heading at the top of the page becomes `pageTitle`, and a sentence that
  runs over the page break is moved onto the next page. The page is also
  rendered to `source.jpg` for the reader when PyMuPDF is installed
  (`--no-image` to skip).
- **Illustrations, not page photos.** Each page's raster images (ornaments
  and dingbats filtered out by size) are extracted at source resolution as
  `fig<k>.jpg` + `figures.json`, each placed after the paragraph the body text
  above it amounts to. The reader shows them inline at that spot and full-screen
  on tap, so the learner can find their place in the physical copy without a
  photo of the English text. Text-only pages get no image at all.
  `--no-figures` restores the old full-page renders (`source.jpg`).
- **Picture pages** (maps, full-page art — anything under `--min-chars` of
  text) are kept as figure-only pages so the app's page sequence mirrors the
  book; the bridge finishes them instantly with no Claude run. A short page
  with no illustration either (dedication, half-title) is dropped.
  `--skip-pictures` drops all picture pages instead.
- **Chapters** come from the PDF outline's top-level entries: every page's
  `status.json` carries `chapter` + `chapterTitle`, the manifest exposes them,
  and the app's contents screen groups pages under tappable chapter headers.
- `--refresh-assets` re-extracts figures and chapter info for pages already on
  disk (dropping their full-page renders) without touching the text or
  running Claude — use it after changing the figure rules on a built book.
- `--mode vision` renders every page to `source.jpg` and lets the bridge's
  Claude-vision stage 1 read it. Use it for scanned PDFs with no text layer,
  or for image-heavy layouts (captions, maps, sidebars) where text extraction
  comes out in a scrambled order.
- Page labels come from the PDF's printed page numbers when it has them
  (`--number pdf` for raw PDF indices; `--offset N` to shift), so they line up
  with the physical book and with pages you scan by camera later.
- `--pages 9-40` / `--pages 9,12,20-25` bounds the run. **Ingest a chapter at a
  time**: the bridge processes every recovered page, one Claude run each, on
  your Max quota. `--dry-run` prints the reflowed sentences without writing.
- A page that already has a `lesson.json` is left alone; `--force` redoes it.
  To redo a handful of pages after a reflow fix, keep the full `--pages` range
  and add `--only 20,23,60`: the whole range is read so sentences spilling
  across page breaks come out the same as in a full run, but only those pages
  are written.

### Own the book only in another language? `--translate-to`

When the PDF is, say, the English edition but the learner is reading French
(paperback in hand, no French PDF to be had), let the bridge translate it:

```bash
python3 bridge/ingest-pdf.py atlas.pdf --book "Atlas de Tolkien" \
    --source English --translate-to French --target English --pages 19-31
```

The ingester stores the PDF text as `original.json`; on its next start the
bridge runs an extra **stage 1b — translate** (one Claude run, sentence for
sentence, established French names for the work where they exist) and commits
the French as `transcript.json`. Enrich then runs on the French as usual, with
one twist: because the French lines up one-to-one with the English, the
**book's own English sentence is passed through as the lesson's translation**
rather than a back-translation. Grammar notes and word breakdowns explain the
French. `status.json` carries `machineTranslated: true` and `originalLanguage`
so you can tell these pages apart from scanned ones.

Two Claude runs per page. The French will read well but won't match a
published French translation word for word — for tap-along reading with a
physical French copy, scanning that copy is still the faithful path.

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
