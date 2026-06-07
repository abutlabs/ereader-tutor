# EReader Tutor

An Android (and iOS) language-learning reader. Photograph a page of a book, and
Claude turns it into an interactive lesson — tap any sentence for a translation,
word-by-word breakdown, A2 grammar notes, and native-voice audio. Each scan grows
a book in local storage.

Built on the prototype reader for _Uit het leven van Dik Trom_ (C. J. Kieviet,
public domain), ported to a real Expo / React Native app.

---

## Status: Phase 0 — Foundation ✅

This is the foundation: the app shell, storage, secure key handling, and the
**reader ported from the web prototype to native** (with real OS Dutch voices via
`expo-speech` instead of browser TTS). The bundled Dik Trom chapters 1–2 (7 pages,
55 sentences, 338 word breakdowns, 176 grammar notes) are preloaded so there's
something to study immediately.

### What works now
- **Projects home** — list / create / delete books.
- **Reader** — flowing tappable Dutch with a drop cap, page navigation, the
  tap-to-translate sheet (translation, word-by-word audio, grammar notes), slow
  mode, mark-as-learned, and **reading position that resumes** where you left off.
- **Settings** — paste your Anthropic API key (stored in the device keystore),
  **test it live**, and choose Opus 4.8 vs Sonnet 4.6 with per-page cost shown.
- **Native audio** — Dutch sentences and words spoken with the OS voice.

### Coming next
- **Phase 1 — Capture:** ML Kit document scanner (edge-detect, deskew, multi-page).
- **Phase 2 — Translate:** wire the scanner to `src/api/claude.ts` — photo →
  resize → Claude vision (one structured-output call) → append page to the book.
- **Phase 2.1 — Render:** the appended page flows straight into this reader.

The Phase 2 engine is already written (`src/api/claude.ts`): a single Claude
vision call with a forced JSON schema returns the exact lesson shape. The Settings
"test key" button exercises it today.

---

## Running it

```bash
npm install
npx expo start
```

Then open it on your phone with the **Expo Go** app (scan the QR). Phase 0 uses
only modules bundled in Expo Go, so no native build is needed yet.

> **Phase 1 will need a dev build.** The document scanner is a native module that
> Expo Go can't load. When we add it, run `npx expo run:android` (local Android
> SDK) or `eas build -p android --profile development` to get an installable APK.
> Same path gives you a shareable APK later.

Type-check at any time with `npm run typecheck`.

---

## Architecture

```
app/                     expo-router screens
  _layout.tsx            fonts + providers
  index.tsx              projects home
  settings.tsx           API key + model
  book/[id].tsx          book view / table of contents
  reader/[id].tsx        the reader

src/
  data/
    schema.ts            Book / Page / Sentence / Word / Note types
    dikTrom.ts           bundled sample lesson data (extracted from the prototype)
  storage/
    books.ts             book repository (file-system, JSON per book)
    progress.ts          learned-set + reading position
    apiKey.ts            secure key store + model preference
  audio/speech.ts        expo-speech wrapper (native Dutch voices)
  api/claude.ts          the Phase 2 vision pipeline (image → structured lesson)
  components/
    SentenceSheet.tsx    the tap-to-translate sheet
  theme/theme.ts         cream-paper / terracotta palette + fonts
```

### Data model
Content-agnostic on purpose: any source (scanned book, public-domain text) fits
the same `BookMeta` + `Page[]` shape, so the engine works on anything. Books are
stored as `books/<id>/book.json` in the app document directory; scanned page
images go in `books/<id>/scans/`.

### The Claude call (Phase 2)
One vision request per page. The page image (base64, resized to ~1568px) plus a
tutor system prompt, with `output_config.format` set to a JSON schema that forces
the lesson structure — no fragile parsing. Sentence IDs are assigned on-device
after the response, keeping them globally unique. Key lives in `expo-secure-store`
and the request goes straight to `api.anthropic.com` (React Native isn't a
browser, so no CORS / no backend). Model is user-selectable; you pay your own usage.

---

## Copyright note
Dik Trom is public domain in the EU (Kieviet died 1931). The text here is a
modern-Dutch rephrasing — a derivative work — with the 1899 phrasing preserved in
the grammar notes. The capture engine is content-agnostic: point it at any
public-domain or rights-cleared text.
