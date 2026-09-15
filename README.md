# CoinLix

Play & Earn rewards app — React Native 0.81.5 + Expo SDK 54, JavaScript/JSX only.
Package `com.coinlix.app`, live on the Play Store.

> **Keep this repository private.** No signing credentials are committed (see
> "Signing key" below), but `google-services.json` and the AdMob/Meta IDs are.

## 0. Set up on a new PC

Everything the build needs is committed except three things that are either huge
or machine-specific: `node_modules/`, the Gradle build output, and the Android
SDK path. Recreate them like this.

**Install once:**

| Tool | Version used here |
|---|---|
| Node.js | 20 LTS or newer |
| JDK | **17** (JDK 21/25 break this Gradle setup) |
| Android SDK | Platform 36, Build-Tools 36.0.0, NDK 27.1.12297006 |

**Then:**

```bash
git clone <this-repo-url> Guptaapp
cd Guptaapp
npm install
```

Create `android/local.properties` pointing at that PC's SDK (the file is
gitignored because the path differs per machine):

```properties
sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk
```

Set these for **every new terminal session** before building (PowerShell):

```powershell
$env:JAVA_HOME = "<path-to-jdk-17>"
$env:ANDROID_HOME = "<path-to-android-sdk>"
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:JAVA_HOME\bin;" + $env:Path
```

### Signing key (the only thing git does NOT carry)

Three files are deliberately kept out of version control, because anyone
holding them can publish an app that Play accepts as ours:

| File | Copy it to |
|---|---|
| `coinlix-release.keystore` | `android/app/coinlix-release.keystore` |
| `keystore.properties` | `android/keystore.properties` |
| `debug.keystore` | `android/app/debug.keystore` |

Move them by hand (USB / encrypted drive / password manager), never by email or
chat. A spare copy lives in `keystore-backup/` on the original machine.

**Losing the release keystore is unrecoverable — the app can never be updated
on Play again.** Back it up in at least two places.

Without it the project still runs and builds; `android/app/build.gradle` falls
back to the debug key, so the output just can't be uploaded to Play.

**Build:**

```powershell
cd android
.\gradlew.bat assembleRelease   # APK, for testing on a device/emulator
.\gradlew.bat bundleRelease     # AAB, for uploading to Play Console
```

Outputs land in `android/app/build/outputs/`. Install the APK with
`adb install -r <path>`.

> **Do not run `expo prebuild --clean`.** The `android/` folder here is
> hand-edited on top of a prebuild (signing config, manifest permissions, the
> AdMob/Meta/Firebase plugin wiring). A clean prebuild wipes those edits.
> Bump the version in **both** `app.json` and `android/app/build.gradle` —
> Play rejects a versionCode that has already been used.

## 1. Setup (fresh project only)

```bash
npm install
npx expo install --fix   # aligns native package versions to your installed Expo SDK
```

### Firebase project

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Sign-in method → Google**
3. Enable **Firestore Database** (start in production mode — rules are provided)
4. Add a **Web app** (even for the mobile app — the config object is what the
   Firebase JS SDK needs) and copy its config into
   [src/services/firebase.js](src/services/firebase.js)
5. Copy the **Web client ID** shown under the Google provider settings into
   `GOOGLE_WEB_CLIENT_ID` in the same file
6. Deploy the security rules and index:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
7. (Optional, for native Android/iOS builds) download `google-services.json`
   / `GoogleService-Info.plist` into the project root and add
   `"googleServicesFile": "./google-services.json"` under `expo.android` in
   [app.json](app.json) — not needed to run in Expo Go for development, and
   left out by default since Expo errors on a path that doesn't exist

### Remote config (optional)

Create a `config/app` document in Firestore to override the in-code
defaults without a rebuild:
```json
{ "dailyBonusAmount": 50, "referralBonus": 100, "minRedeem": 5000 }
```
If it's missing or unreachable, the app falls back to those same defaults.

## 2. Run

```bash
npx expo start
```
Scan the QR code with Expo Go, or press `a` / `i` for an emulator/simulator.

> Google Sign-In via `expo-auth-session` needs a dev build or Expo Go with a
> registered redirect URI — for Expo Go, add
> `https://auth.expo.io/@your-expo-username/coinlix` as an authorized
> redirect URI under the Google provider in Firebase Auth settings.

## 3. Folder map

```
src/
  components/     Button, Card, CoinBadge, ScreenHeader, SectionHeader, EmptyState, Loader, Toast
  context/        AuthContext (Google + Guest), AppContext (coins/wallet/referral)
  navigation/     AppNavigator (tabs + stacks), custom TabBar
  screens/        LoginScreen, HomeScreen, GamesScreen, WalletScreen, ProfileScreen
  services/       firebase.js (config), firestoreStore.js (all Firestore I/O)
  utils/          theme.js, format.js, haptics.js, referral.js
App.js
firestore.rules
firestore.indexes.json
```

## 4. How coin sync works (read this before touching AppContext.jsx)

- **Local-first**: every coin change writes to AsyncStorage immediately with
  a `_localSavedAt` timestamp. The UI never waits on the network.
- **Cloud read on login**: a *missing* cloud doc (new account) and a
  *failed/timed-out* read are handled differently — a timed-out read never
  gets treated as "empty," so a flaky connection on a fresh install can't
  wipe a real cloud balance with 0.
- **No cloud writes happen until a read has been confirmed this session**
  (either the initial read succeeded, or the realtime listener delivered a
  value).
- **Realtime listener only syncs coins up.** If another device's value is
  lower than what's local, it's ignored — a stale server read must never
  lower a locally-earned balance.
- **Writes are throttled** (roughly every 3 minutes) with an authoritative
  flush when the app backgrounds, so we're not hammering Firestore on every
  tap.
- **Guests** never touch Firestore — everything stays on-device until they
  sign in with Google, at which point their local progress carries over
  automatically (see `ensureUserProfile` + the hydration effect).

## 5. Referral crediting — why it's two-sided

Firestore rules only ever let a signed-in user write their *own*
`users/{uid}` doc — a referee's client can't be trusted to increment a
stranger's coin balance directly. So claiming a code writes only to the
referee's own docs (`referredBy`, plus a one-time `referralClaims/{uid}`
entry); the **referrer** credits themselves the next time their own app
opens, by reading claims where they're the referrer and applying the bonus
locally. See the comment block in
[src/services/firestoreStore.js](src/services/firestoreStore.js) for the
full walkthrough. For production, moving this to a Cloud Function trigger
(so the referrer gets credited instantly, not on next open) is the natural
next step — same trust boundary as the reward code allocation described in
the rewards-section prompt.

## 6. Assets

`assets/icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png` are
solid-color placeholders (brand purple) just so `expo start` has something
valid to load — swap them for real artwork whenever you have it.

## 7. What's built since the original foundation

- **20 mini games** + Quick Earn tasks, all with original SVG artwork in
  `src/components/art/`
- **AdMob**: rewarded ad gating every claim, interstitial every 3 minutes,
  app-open ad on launch/resume, with `adGate.js` preventing ads stacking
- **Meta / Facebook SDK** for install attribution, including the `AdImpression`
  value event forwarded from AdMob's impression-level revenue
- **Redeem Code** screen (₹100–₹5000 Google Play codes at 100 coins = ₹1)
- **Easy Rewards** catalog, daily check-in, 2-tier referrals

Still open: offerwalls, push notifications, admin dashboard, dark theme, and
the Wallet catalog's prices, which are still hand-set rather than derived from
`COINS_PER_INR` in `src/data/redeemCodes.js`.
