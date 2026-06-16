// Audio for sentences and words. Sentences narrated by the bridge (Chatterbox
// TTS, synced to a local file in audioUrl) play that recording via expo-audio;
// everything else falls back to expo-speech — the OS's native Dutch voices
// (Xander/Claire on iOS, Google nl-NL on Android). Same id-toggle semantics
// either way: tap to play, tap the same thing again to stop.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";

// Match expo-speech's behavior: narration audible with the iOS mute switch on.
setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

type Listener = (speakingId: string | null) => void;
let current: string | null = null;
let player: AudioPlayer | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(current);
}

function releasePlayer() {
  if (player) {
    try {
      player.remove();
    } catch {
      /* already released */
    }
    player = null;
  }
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
  releasePlayer();
  if (current !== null) {
    current = null;
    emit();
  }
}

/**
 * Speak `text`, tagging the utterance with `id` so the UI can show what's
 * playing. Calling speak with the id that's already playing stops it (toggle).
 * When `audioUrl` points at a synced narration file, that recording plays
 * instead of synthesized speech.
 */
export function speak(
  text: string,
  id: string,
  opts: { language?: string; slow?: boolean; audioUrl?: string } = {},
) {
  if (current === id) {
    stop();
    return;
  }
  Speech.stop();
  releasePlayer();
  current = id;
  emit();

  if (opts.audioUrl) {
    const p = createAudioPlayer(opts.audioUrl);
    player = p;
    p.setPlaybackRate(opts.slow ? 0.7 : 1.0, "high");
    p.addListener("playbackStatusUpdate", (status) => {
      if (status.didJustFinish && current === id) {
        releasePlayer();
        current = null;
        emit();
      }
    });
    p.play();
    return;
  }

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
