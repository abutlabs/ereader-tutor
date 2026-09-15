// Books that ship INSIDE the app as Hearth packages (assets/books/<id>.zip) and
// install themselves into the library on first launch — for books whose
// illustrations make a TypeScript seed file impractical. Built on the laptop
// with bridge/package-book.py. A bundled book that's missing (never installed,
// or deleted) is (re)installed on the next launch; one already in the library
// is left alone, so progress and word lists survive app updates.
//
// ⚠️ PRIVATE BUILDS ONLY for copyrighted titles — see BETA_CHECKLIST.md.

import { Asset } from "expo-asset";
import { getBook } from "./books";
import { installPackage } from "../transfer/package";

interface BundledBook {
  id: string;
  module: number; // require("../../assets/books/<id>.zip")
}

// ⚠️ GIFT BUILD ONLY — "Atlas de Tolkien" is a private study copy built from a
// purchased edition. Remove this entry and assets/books/atlas-de-tolkien.zip
// before any Play Store release.
export const BUNDLED_BOOKS: BundledBook[] = [
  { id: "atlas-de-tolkien", module: require("../../assets/books/atlas-de-tolkien.zip") },
  // Le Petit Prince starter books — French→English and Dutch→English, built
  // from purchased editions (text is the real edition; lessons by Claude).
  { id: "le-petit-prince", module: require("../../assets/books/le-petit-prince.zip") },
  { id: "de-kleine-prins", module: require("../../assets/books/de-kleine-prins.zip") },
];
export const BUNDLED_IDS = new Set(BUNDLED_BOOKS.map((b) => b.id));

let done: Promise<void> | null = null;

// Install any bundled book not yet in the library. Safe to call on every
// launch; runs once per process. Failures are logged, never thrown — the app
// must still open.
export function ensureBundledBooks(): Promise<void> {
  if (!done) {
    done = (async () => {
      for (const b of BUNDLED_BOOKS) {
        try {
          if (await getBook(b.id)) continue;
          const asset = Asset.fromModule(b.module);
          await asset.downloadAsync();
          const uri = asset.localUri ?? asset.uri;
          if (!uri) throw new Error("asset has no local uri");
          await installPackage(uri, "new");
        } catch (e) {
          console.warn(`Bundled book "${b.id}" failed to install:`, e);
        }
      }
    })();
  }
  return done;
}
