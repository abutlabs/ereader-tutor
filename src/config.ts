// Feature flags.
//
// STORE_ENABLED: the in-app Bookstore and paid books are fully built but turned
// OFF for the initial launch — everything is free and every book in the library
// is visible (including your own imported/created books). Flip this to true to
// bring back entitlement gating + the Bookstore section; you'll also swap the
// billing provider in src/billing (MockBilling → RevenueCat). The store code
// stays dormant, not deleted.
export const STORE_ENABLED = false;
