// The book catalog — the single source of truth for every book bundled with the
// app. Lesson data ships inside the binary (text is tiny); an entitlement decides
// whether a book is readable. Free books are unlocked for everyone; paid books
// unlock after purchase. See src/storage/entitlements.ts and src/billing.
//
// To add a paid book: author its <book>.ts data, add an entry here with
// access:"paid" + a productId, then create the matching in-app product in Play /
// RevenueCat. New book = app update.
import type { BookMeta, Page } from "./schema";
import { BOOK_META as DIK_META, BOOK_PAGES as DIK_PAGES } from "./dikTrom";
import { FABLES_META, FABLES_PAGES } from "./fables";
import { IDIOMS_META, IDIOMS_PAGES } from "./idioms";
// BETA ONLY — under copyright. Remove this import + the catalog entry below
// (and src/data/otje.ts) before any Play Store release.
import { OTJE_META, OTJE_PAGES } from "./otje";

export interface CatalogItem {
  id: string; // also the storage folder/slug
  meta: BookMeta;
  pages: Page[];
  access: "free" | "paid";
  productId?: string; // Play / RevenueCat product id (paid only)
  price?: string; // display fallback until live store pricing loads
  blurb?: string; // one-line store pitch
}

export const CATALOG: CatalogItem[] = [
  {
    id: "aesop-fables",
    meta: FABLES_META,
    pages: FABLES_PAGES,
    access: "free",
    blurb: "Twaalf korte fabels — je gratis startboek.",
  },
  {
    id: "dutch-idioms",
    meta: IDIOMS_META,
    pages: IDIOMS_PAGES,
    access: "free",
    blurb: "Twintig spreekwoorden en uitdrukkingen — één idioom per kaart.",
  },
  {
    id: "dik-trom",
    meta: DIK_META,
    pages: DIK_PAGES,
    access: "paid",
    productId: "book_dik_trom",
    price: "$1.99",
    blurb: "De klassieke Nederlandse jongen — hoofdstuk 1 & 2.",
  },
  // ⚠️ BETA ONLY — "Otje" is under copyright. Delete this entry, the import above,
  // and src/data/otje.ts before shipping to the Play Store.
  {
    id: "otje",
    meta: OTJE_META,
    pages: OTJE_PAGES,
    access: "free",
    blurb: "Otje — beta only, niet voor distributie.",
  },
];

export function catalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.id === id);
}

export const CATALOG_IDS = new Set(CATALOG.map((c) => c.id));
