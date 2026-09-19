# EReader Tutor

A language-learning reader for iOS and Android. Photograph a page of a foreign
book (or build full books from epub), and Claude turns it into an interactive lesson — tap any sentence for a
translation, word-by-word breakdown, A2 grammar notes, and native-voice audio.
Each scan grows a book in local storage; the original page artwork is kept and
shown alongside the text (great for children's books).

Built on a prototype reader for _Uit het leven van Dik Trom_ (C. J. Kieviet,
public domain), now a real Expo / React Native app.

---

## Try the current build (v0.1.0)

### Android: sideload the APK

Scan the QR code with your phone to download the sideloadable APK (tap the
image to open it full size). Enable "install unknown apps" for your browser or
files app when Android asks.

<a href="ereader-tutor-apk-qr.png"><img src="ereader-tutor-apk-qr.png" alt="QR code linking to the EReader Tutor Android APK" width="220"></a>

This is a release build (arm64 only, ~50 MB): the pure reader experience, with
the scanning, bridge and API settings hidden. Every book below is installed on
first launch, so there is something to read straight away.

### iPhone (or Android): open it in Expo Go

No Apple developer account, TestFlight or App Store involved. The app is
published with EAS Update and runs inside the free **Expo Go** app.

1. Install **Expo Go** from the App Store (or Play Store).
2. Scan this code with the phone's camera and pick *Open in Expo Go*, or paste
   the link into Expo Go's *Enter URL manually* field:

   <a href="ereader-tutor-expo-go-qr.png"><img src="ereader-tutor-expo-go-qr.png" alt="QR code that opens EReader Tutor in Expo Go" width="220"></a>

   ```
   exp://u.expo.dev/de4633f4-d751-4218-84ca-3c2ce841f723?channel-name=preview&runtime-version=exposdk:57.0.0
   ```

3. First open downloads the bundle and the starter books (about 10 MB); after
   that it works offline and reopens from Expo Go's *Recently opened* list.

The link always points at the newest update on the `preview` channel, so a
tester never needs a new link. Expo Go may ask them to sign in with a free Expo
account before loading a published project. Like the APK, this is a production
bundle, so the scanning, bridge and API settings are hidden.

#### Publishing a new version to Expo Go

```bash
npx eas-cli update --channel preview --environment preview --message "what changed"
```

That re-exports the JS bundle and assets and publishes them; testers get it the
next time they open the app. Notes:

- The runtime version is pinned to the Expo SDK (`exposdk:57.0.0`, via the
  `sdkVersion` policy in `app.json`) because that is the only runtime Expo Go
  will load. After an SDK upgrade, testers need the matching Expo Go from the
  store and the link's `runtime-version` changes.
- The same channel feeds the sideload APK: `eas.json` maps the `preview` build
  profile to the `preview` channel, so an APK built from now on also picks up
  these updates on launch. Use `--channel production` for Play Store builds.
- Anything that adds a native module (a new `expo-*` package with native code)
  won't reach Expo Go and needs a real build instead.

### Starter books in this build

| Book | Author | Read in | Lessons in | Size | Notes |
| --- | --- | --- | --- | --- | --- |
| Fabels van Aesopus | Aesop (retold) | Dutch | English | 12 fables | Free starter book |
| Spreekwoorden & Uitdrukkingen | Dutch folk wisdom | Dutch | English | 20 idiom cards, 5 themes | Free |
| Uit het leven van Dik Trom | C. Joh. Kieviet | Dutch | English | Chapters 1–2 (7 pages) | Sample of the public-domain classic |
| Le Petit Prince | Antoine de Saint-Exupéry | French | English | 27 chapters, 86 pages, illustrated | Private build only |
| De Kleine Prins | Antoine de Saint-Exupéry | Dutch | English | 27 chapters, 61 pages, illustrated | Private build only |
| Atlas de Tolkien | David Day | French | English | 9 chapters, 178 pages, illustrated | Private build only |
| Otje | Annie M.G. Schmidt | Dutch | English | 26 pages | Beta only |

**Languages:** source text in **Dutch** and **French**; every lesson
(translations, word-by-word breakdowns, grammar notes) is written in **English**.
The engine itself is language-agnostic, and the lesson language is configurable
per book.

The titles marked *private build only* and *beta only* are copyrighted editions
bundled for personal study; they are stripped before any Play Store release (see
[`BETA_CHECKLIST.md`](BETA_CHECKLIST.md)). The three Dutch starter books are the
public catalog.

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
modules bundled in Expo Go, so no native build is needed. To hand a build to a
tester without running Metro, publish it with EAS Update instead — see
[iPhone (or Android): open it in Expo Go](#iphone-or-android-open-it-in-expo-go).

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
