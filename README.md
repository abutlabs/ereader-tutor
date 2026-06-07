# EReader Tutor

A language-learning reader for iOS and Android. Photograph a page of a foreign
book, and Claude turns it into an interactive lesson — tap any sentence for a
translation, word-by-word breakdown, A2 grammar notes, and native-voice audio.
Each scan grows a book in local storage; the original page artwork is kept and
shown alongside the text (great for children's books).

Built on a prototype reader for _Uit het leven van Dik Trom_ (C. J. Kieviet,
public domain), now a real Expo / React Native app.

---

## What it does

- **Scan → lesson.** Photograph a page (camera or gallery). Claude reads it,
  transcribes the source text, translates it, and produces a per-sentence
  breakdown (word-by-word + grammar notes). The page appends to the book.
- **Two translation sources** (Settings → Translation source):
  - **Anthropic API key** — pay-as-you-go, works anywhere.
  - **Local Claude Code bridge (Max plan)** — free via your Claude Max
    subscription, by running a tiny server on your laptop. See
    [`bridge/README.md`](bridge/README.md).
- **Reader.** Flowing, tappable text with a drop cap; the page photo shown above
  it; a tap-to-translate sheet (translation, word-by-word audio, grammar notes,
  slow mode); native-voice audio; learned markers (dim + ✓); and a reading
  position that resumes where you left off.
- **Study word list.** Bookmark any word or phrase from the breakdown into a
  per-book list to come back to — separate from the quick "learned" tap.
- **Book metadata.** Editable author and **status** (open → complete), and a
  configurable **lesson language** (translations/notes are written in *your*
  language — English by default, any language supported).
- **Contents index.** A per-book table of contents with per-page progress;
  long-press to **re-label** a page to its real book number. Marking a book
  complete builds an `index.html` of the formatted study pages.
- **Page numbering.** Each scan is labelled with its real book page number
  (so out-of-order scans and gaps are fine); Claude also reads the printed
  number as a cross-check.

---

## Running it

```bash
npm install
npx expo start
```

Open it on your phone with **Expo Go** (scan the QR). Everything currently uses
modules bundled in Expo Go, so no native build is needed.

To use the free **Max-plan bridge**, also run the laptop server (separate
terminal) and point the app at it — see [`bridge/README.md`](bridge/README.md):

```bash
node bridge/server.mjs
```

Type-check at any time with `npm run typecheck`.

> A future document-scanner (ML Kit edge-detect/deskew) is a native module that
> Expo Go can't load; that step will need a dev build (`npx expo run:android` or
> an EAS build). The current camera/gallery capture works in Expo Go today.

---

## Architecture

```
app/                       expo-router screens
  _layout.tsx              fonts + providers
  index.tsx                projects home (status badges)
  settings.tsx             API key / model / translation source
  book/[id].tsx            book view — scan, sync, word list, contents, edit
  edit/[id].tsx            edit metadata — author, status, lesson language
  contents/[id].tsx        table of contents + per-page progress + re-label
  wordlist/[id].tsx        saved word/phrase study list
  reader/[id].tsx          the reader

src/
  data/
    schema.ts              Book / Page / Sentence / Word / Note + status, languages
    languages.ts           source/target language helpers
    dikTrom.ts             bundled sample lesson data
  storage/
    books.ts               book repository (JSON per book) + page images
    progress.ts            learned-set + reading position
    wordlist.ts            per-book saved words/phrases
    apiKey.ts              secure key store, model + source + bridge-url prefs
  capture/scan.ts          capture → translate pipeline (API + bridge) + sync + relabel
  api/claude.ts            Claude vision call + bridge client
  audio/speech.ts          expo-speech wrapper (native voices)
  components/
    SentenceSheet.tsx      tap-to-translate sheet (+ word bookmarks)
    ScanOverlay.tsx        capture progress / queued / done states
    NumberPrompt.tsx       page-number / re-label modal
  theme/theme.ts           cream-paper / terracotta palette + fonts

bridge/                    laptop server for the Max-plan path (see its README)
projects/                  bridge output: projects/<book>/Page<N>/ (gitignored)
```

### Data model
Content-agnostic on purpose: any source (scanned book, public-domain text) fits
the same `BookMeta` + `Page[]` shape. Books are stored as `books/<id>/book.json`
in the app document directory; page photos in `books/<id>/images/`.

### The Claude call
- **API-key path:** one vision request per page with `output_config.format` set
  to a JSON schema that forces the lesson structure — no fragile parsing. The
  key lives in `expo-secure-store`; the request goes straight to
  `api.anthropic.com` (React Native isn't a browser, so no backend/CORS). Model
  is user-selectable (Sonnet 4.6 by default; Opus 4.8 available).
- **Bridge path:** the laptop runs Claude Code headless under your Max plan, in
  two committed stages (transcribe → enrich) with the work archived to disk and
  resumable. Fully documented in [`bridge/README.md`](bridge/README.md).

---

## Copyright note
Dik Trom is public domain in the EU (Kieviet died 1931). The bundled text is a
modern-Dutch rephrasing — a derivative work — with the 1899 phrasing preserved in
the grammar notes. The engine is content-agnostic: point it at any public-domain
or rights-cleared text.
