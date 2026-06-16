// Developer mode. The content-production features — scanning a page, the Claude
// API / local bridge settings, bridge sync, and creating/importing books — only
// make sense when running the app from source (you need a laptop bridge or an API
// key). Play Store users can't use them, so they're hidden there entirely.
//
// __DEV__ is true in an Expo dev run and false in any release/Play build, so dev
// features are NEVER visible in production. Within a dev run you can still toggle
// this off (Settings) to preview exactly what a normal user sees.

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "dev:mode";

// Whether the dev toggle even exists (only when running from source).
export const DEV_AVAILABLE: boolean = __DEV__;

let cached = true; // default ON within a dev run
let loaded = false;
const listeners = new Set<(v: boolean) => void>();

// Effective dev mode: forced off unless running from source.
function effective(): boolean {
  return DEV_AVAILABLE && cached;
}

function emit() {
  const v = effective();
  for (const l of listeners) l(v);
}

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw != null) cached = raw === "1";
  } catch {
    /* keep default */
  }
  emit();
}

export async function setDevMode(v: boolean): Promise<void> {
  cached = v;
  try {
    await AsyncStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* non-fatal */
  }
  emit();
}

// Reactive read of the effective dev mode. Components re-render when it changes.
export function useDevMode(): boolean {
  const [v, setV] = useState(effective());
  useEffect(() => {
    if (!DEV_AVAILABLE) return; // production: always off, nothing to load
    listeners.add(setV);
    ensureLoaded();
    return () => {
      listeners.delete(setV);
    };
  }, []);
  return v;
}
