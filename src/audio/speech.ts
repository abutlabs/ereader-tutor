// Thin wrapper over expo-speech. On a real device this uses the OS's native
// Dutch voices (Xander/Claire on iOS, Google nl-NL on Android) — markedly better
// than the prototype's web SpeechSynthesis. Same id-toggle semantics: tap to
// play, tap the same thing again to stop.

import * as Speech from "expo-speech";

type Listener = (speakingId: string | null) => void;
let current: string | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(current);
}

export function onSpeakingChange(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getSpeakingId(): string | null {
  return current;
}

export function stop() {
  Speech.stop();
  if (current !== null) {
    current = null;
    emit();
  }
}

/**
 * Speak `text`, tagging the utterance with `id` so the UI can show what's
 * playing. Calling speak with the id that's already playing stops it (toggle).
 */
export function speak(
  text: string,
  id: string,
  opts: { language?: string; slow?: boolean } = {},
) {
  if (current === id) {
    stop();
    return;
  }
  Speech.stop();
  current = id;
  emit();
  Speech.speak(text, {
    language: opts.language ?? "nl-NL",
    rate: opts.slow ? 0.6 : 0.92,
    onDone: () => {
      if (current === id) {
        current = null;
        emit();
      }
    },
    onStopped: () => {
      if (current === id) {
        current = null;
        emit();
      }
    },
    onError: () => {
      if (current === id) {
        current = null;
        emit();
      }
    },
  });
}
