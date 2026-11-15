import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Spectral_400Regular,
  Spectral_500Medium,
  Spectral_400Regular_Italic,
} from "@expo-google-fonts/spectral";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import { colors, motion } from "../src/theme/theme";
import { ensureBundledBooks } from "../src/storage/bundled";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Spectral_400Regular,
    Spectral_500Medium,
    Spectral_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Bundled books (assets/books/*.zip) install on first launch, behind the
  // splash screen so the library is complete the first time the home screen shows.
  const [booksReady, setBooksReady] = useState(false);
  useEffect(() => {
    // Root view behind every screen — white on e-ink, not the cream splash colour.
    SystemUI.setBackgroundColorAsync(colors.paper).catch(() => {});
    ensureBundledBooks().finally(() => setBooksReady(true));
  }, []);

  useEffect(() => {
    if (fontError) console.warn("Font loading failed:", fontError);
    if ((loaded || fontError) && booksReady) SplashScreen.hideAsync();
  }, [loaded, fontError, booksReady]);

  if ((!loaded && !fontError) || !booksReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
          animation: motion("slide_from_right"),
        }}
      />
    </SafeAreaProvider>
  );
}
