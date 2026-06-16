# Beta release checklist (Android)

Everything in the repo is ready to build. The steps below are the ones that need
**your** accounts/credentials — Claude can't do them because they require an
interactive login or a paid account.

Run the `npx eas-cli@latest …` commands from the project root. In Claude Code you
can prefix a command with `!` to run it in the session.

---

## 1. One-time EAS setup (required before any build)

1. Create a free Expo account → https://expo.dev
2. Log in locally:
   ```
   npx eas-cli@latest login
   ```
3. Link this repo to an EAS project (writes `extra.eas.projectId` into `app.json`):
   ```
   npx eas-cli@latest init
   ```
   **Commit the `app.json` change** that this produces.

## 2. Build the beta APK (sideloadable, no Play Store needed)

```
npx eas-cli@latest build -p android --profile preview
```
- First run, when asked to **generate a keystore, say yes** (EAS stores it in your
  account and uses it to sign every future build — don't lose the account).
- When the build finishes, open the printed URL, **download the `.apk`**, and
  install it on an Android phone (enable "install unknown apps" for your browser/
  files app).
- This is a release build, so developer tools (scanning, bridge, API settings) are
  hidden — it's the pure reader experience a Play Store user gets.

## 3. Enable the GitHub Actions build (optional but recommended)

1. expo.dev → Account → **Settings → Access tokens** → create a token.
2. GitHub repo → **Settings → Secrets and variables → Actions** → New repository
   secret → name `EXPO_TOKEN`, paste the token.
3. Push this branch (and merge to `main` when ready). Then **Actions tab → "EAS
   Build (Android)" → Run workflow** → choose `preview` or `production`.
   - Or push a tag like `v0.1.0` to trigger a `production` (AAB) build.

---

## Later: Google Play Store

Not needed for the sideloaded beta. When ready:

1. Pay the one-time **$25** Google Play Developer registration → https://play.google.com/console
2. Create the app (package `com.ereadertutor.app`), fill the store listing
   (needs: a privacy-policy URL, a 1024×500 feature graphic, screenshots,
   descriptions, content rating, and "data safety" answers).
3. Create a **service account** with Play access, download its JSON key, save it as
   `play-service-account.json` in the project root (already gitignored).
4. Submit from the production build:
   ```
   npx eas-cli@latest submit -p android --profile production
   ```
   (eas.json is already configured to submit to the **internal testing** track.)

---

## Later: over-the-air content updates (ship new books without a rebuild)

Books are pure JS/TS data, so new books and lesson fixes can be pushed to installed
apps without a new APK or Play review. To enable:

1. `npx expo install expo-updates`
2. `npx eas-cli@latest update:configure`
3. Then publish updates with `npx eas-cli@latest update --branch preview -m "New book"`.
   Only native changes (new permissions, in-app purchases) still need a full rebuild.

---

## Version bumps

- The human version (`app.json` → `expo.version`, currently `0.1.0`) — bump manually
  per release.
- `versionCode` — managed by EAS (`appVersionSource: "remote"`, auto-incremented on
  the `production` profile). Don't set it by hand.
