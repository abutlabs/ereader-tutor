// Hearth design system — "Terracotta" palette (warm cream + terracotta), the
// shipped default from the Hearth redesign handoff. Token names from the prior
// theme are preserved (remapped to Hearth values) so existing screens adopt the
// new look for free; the richer tokens below power the redesigned screens.

import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

// ── E-ink mode ────────────────────────────────────────────────────────────────
// Colour e-ink (BOOX Note Air6 C) ghosts on tinted backgrounds and smears
// animations, so e-ink mode is pure white/black with no motion. It's decided
// once, synchronously, before any screen's StyleSheet is built — every module
// that imports `colors` gets the right palette. Changing it reloads the app.
//   pref "auto" (default): on for Onyx/BOOX devices; "on"/"off": forced.

export type EinkPref = "auto" | "on" | "off";
const EINK_KEY = "display_eink";

export function isEinkDevice(): boolean {
  const id = [Device.manufacturer, Device.brand, Device.modelName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\b(onyx|boox)\b/.test(id);
}

function readEinkPref(): EinkPref {
  try {
    const v = SecureStore.getItem(EINK_KEY);
    return v === "on" || v === "off" ? v : "auto";
  } catch {
    return "auto";
  }
}

export const einkPref: EinkPref = readEinkPref();
export const EINK: boolean = einkPref === "on" || (einkPref === "auto" && isEinkDevice());

/** Persist the preference; the caller reloads the app to apply it. */
export function saveEinkPref(pref: EinkPref): void {
  try {
    if (pref === "auto") SecureStore.deleteItemAsync(EINK_KEY);
    else SecureStore.setItem(EINK_KEY, pref);
  } catch {
    /* non-fatal: stays on the current mode */
  }
}

/** Modal/screen animation: none on e-ink. */
export function motion<T extends string>(normal: T): T | "none" {
  return EINK ? "none" : normal;
}

/** Visible edge for cards, which otherwise rely on a tinted background. */
export const cardEdge = EINK
  ? { borderWidth: 1, borderColor: "#000000" }
  : {};

const einkColors = {
  paper: "#ffffff",
  paperWarm: "#ffffff",
  paperSoft: "#ffffff",
  card: "#ffffff",
  cardDeep: "#ffffff",
  ink: "#000000",
  inkSoft: "#262626",
  inkFaint: "#4d4d4d",
  rule: "#808080",
  ruleSoft: "#b3b3b3",
  accent: "#000000",
  accentDeep: "#000000",
  accentSoft: "#e0e0e0",
  gold: "#000000",
  good: "#000000",
  goodSoft: "#ffffff",
  scrim: "rgba(0,0,0,0.25)",
  overlay: "rgba(0,0,0,0.25)",
};

const hearthColors = {
  paper: "#efe7d7", // screen background
  paperWarm: "#f3ecdd", // headers, footers
  paperSoft: "#fbf6ec", // legacy alias → Hearth `card` (cards/sheets/inputs)
  card: "#fbf6ec", // cards, inputs
  cardDeep: "#f5eede", // recessed cards, chips
  ink: "#2c1e11", // primary text
  inkSoft: "#5e4c38", // secondary text
  inkFaint: "#917d63", // tertiary text, labels
  rule: "#ddcfb4", // hairlines, switch off-track
  ruleSoft: "#e8dcc4", // soft borders/dividers
  accent: "#c05a2e", // primary action, active, ring
  accentDeep: "#a4481f", // pressed/dark accent
  accentSoft: "#eed2bd", // active sentence bg, audio idle
  gold: "#c8902f", // progress gradient end, glow
  good: "#5d7d4f", // learned / success
  goodSoft: "#d9e3cf", // learned button bg, success cards
  scrim: "rgba(40,28,17,0.5)", // modal/sheet scrim
  overlay: "rgba(40,28,17,0.5)", // legacy alias → scrim
};

export const colors: typeof hearthColors = EINK ? einkColors : hearthColors;

// Editorial pairing — Fraunces (display) + Spectral (body) + DM Sans (ui).
export const fonts = {
  body: "Spectral_400Regular",
  bodyMedium: "Spectral_500Medium",
  bodyItalic: "Spectral_400Regular_Italic",
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  uiRegular: "DMSans_400Regular",
  ui: "DMSans_500Medium",
  uiSemibold: "DMSans_700Bold", // DM Sans 600 isn't shipped in this package; 700 is the closest emphasis
  uiBold: "DMSans_700Bold",
};

export const radius = {
  sm: 11,
  md: 16,
  lg: 22,
  sheet: 26,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

// A deterministic warm hue (0–360) from a string, for book covers.
export function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
// Cover gradient stops for a given hue (light → dark, warm-literary).
export function coverGradient(hue: number): [string, string] {
  if (EINK) return ["#262626", "#000000"];
  return [`hsl(${hue}, 42%, 46%)`, `hsl(${hue}, 38%, 31%)`];
}
