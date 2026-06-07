// The warm, literary reading-room palette carried over from the prototype.
// Cream paper, terracotta accent, serif body — the character of a print book.

export const colors = {
  paper: "#f4f1ea", // main cream background
  paperSoft: "#efe9db", // slightly deeper cream for cards/sheets
  ink: "#2a1d10", // near-black warm brown for text
  inkSoft: "#5b4a37", // secondary text
  rule: "#cdbfa3", // hairline rules / disabled
  accent: "#bf5b30", // terracotta — highlights, learned markers, audio
  accentSoft: "#e8c4ad", // amber flood for active sentence
  good: "#5a7d4f", // muted green for "learned"
  overlay: "rgba(30, 22, 12, 0.45)", // sheet scrim
};

// Font family names match the @expo-google-fonts packages loaded in _layout.
export const fonts = {
  body: "Spectral_400Regular",
  bodyMedium: "Spectral_500Medium",
  bodyItalic: "Spectral_400Regular_Italic",
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  ui: "DMSans_500Medium",
  uiRegular: "DMSans_400Regular",
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const spacing = (n: number) => n * 4;
