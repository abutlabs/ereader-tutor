// Hearth design system — "Terracotta" palette (warm cream + terracotta), the
// shipped default from the Hearth redesign handoff. Token names from the prior
// theme are preserved (remapped to Hearth values) so existing screens adopt the
// new look for free; the richer tokens below power the redesigned screens.

export const colors = {
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
  return [`hsl(${hue}, 42%, 46%)`, `hsl(${hue}, 38%, 31%)`];
}
