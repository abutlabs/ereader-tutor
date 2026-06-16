// Billing seam. One interface, swappable implementations.
//
// TODAY — MockBilling: "buys" a book by granting the entitlement locally. This
// lets the entire store flow (browse → buy → unlock → read) run in Expo Go with
// no Play account, no native module, no real charge. Perfect for building/testing
// the UX before the store is live.
//
// LATER — RevenueCatBilling: wrap react-native-purchases. RevenueCat handles
// Google Play Billing, receipt validation, and restore with no server. ONLY this
// file changes: implement purchase()/restore() against Purchases, map product ids
// (CatalogItem.productId) to offerings, and on a verified purchase call unlock().
// Requires a custom dev build (the native module won't run in Expo Go).
//
// See the Play Store plan in memory (playstore-v1-scope).

import { unlock } from "../storage/entitlements";
import type { CatalogItem } from "../data/catalog";

export interface PurchaseResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

export interface BillingProvider {
  /** Whether this provider can charge real money (false = local mock). */
  readonly live: boolean;
  /** Run the store purchase flow for a book; grant it on success. */
  purchase(item: CatalogItem): Promise<PurchaseResult>;
  /** Re-grant previously bought books (e.g. new device / reinstall). */
  restore(): Promise<void>;
}

const MockBilling: BillingProvider = {
  live: false,
  async purchase(item) {
    try {
      await unlock(item.id);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Purchase failed" };
    }
  },
  async restore() {
    // No-op: mock purchases are already stored locally as entitlements.
  },
};

// The active provider. Swap to RevenueCatBilling once the dev build + Play
// products + RevenueCat keys exist.
export const billing: BillingProvider = MockBilling;
