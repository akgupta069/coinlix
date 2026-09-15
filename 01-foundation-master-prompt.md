# MASTER PROMPT — "Play & Earn" Games App (Foundation Build)

You are building a new **React Native + Expo** mobile app from scratch: a **Play & Earn games app for the Indian market**. Users play casual games/activities to earn coins and redeem them for rewards.

**Scope of THIS pass: build the FOUNDATION ONLY** — architecture, theme, navigation, auth, coins, wallet, referral, profile. Actual games and extra features will be added later in separate prompts. Build it so those slot in cleanly.

---

## 1. TECH STACK (use exactly this)
- **React Native + Expo** (latest stable SDK), **JavaScript + JSX only — no TypeScript**
- **Navigation**: `@react-navigation/native` + bottom-tabs + native-stack
- **Backend**: Firebase — **Auth** (Google Sign-In) + **Firestore**
- **Local storage**: `@react-native-async-storage/async-storage`
- **UI libs**: `expo-linear-gradient`, `react-native-safe-area-context`, `react-native-svg`, `expo-haptics`
- Keep dependencies minimal. Do NOT add ads, analytics, or game engines in this pass.

## 2. DESIGN SYSTEM — LIGHT THEME (most important)
**Rule: ONE theme source of truth. ZERO hardcoded colors/sizes anywhere else.**

Create `src/utils/theme.js` exporting:
- `Colors`: primary, primaryDark, accent, background, surface, surfaceAlt, border, text, textSec, textMuted, success, warning, danger, coin(gold)
- `Spacing`: xs, sm, md, lg, xl
- `Radius`: sm, md, lg, xl, pill
- `Typography`: h1, h2, h3, body, small, caption (size + weight)
- `Shadows`: card, floating

Requirements:
- **Light theme only**, modern, clean, professional (soft surfaces, subtle shadows, rounded corners, generous spacing)
- Every screen/component imports from theme — **no raw hex, no magic numbers in screens**
- One accent/primary color used consistently for all CTAs

## 3. NAVIGATION / SCREENS
Bottom tab navigator (4 tabs), each with a native stack where needed:
1. **Home** — greeting, coin balance, daily bonus card, "Play & Earn" grid (placeholder cards for future games), referral banner
2. **Games** — grid/list of game cards (placeholders for now, clearly extensible)
3. **Wallet** — coin balance, transaction history (earned/redeemed filters), rewards/redeem catalog (placeholder list)
4. **Profile** — avatar, name, email, stats (total earned/redeemed, referrals), settings, logout

Include a polished custom tab bar (icons + active state from theme).

## 4. AUTH (Google + Guest)
- `src/context/AuthContext.jsx`
- **Google Sign-In** (Firebase Auth) and **Guest mode** (continue without login)
- Clean Login screen shown when logged out; guest can browse and earn, but **only Google-logged-in users' coins persist to cloud**
- Guest → Google upgrade path: on login, carry over local progress
- Handle: loading state, errors, logout

## 5. COINS + WALLET
- `src/context/AppContext.jsx` — global state: coins, transactions, user stats
- API: `addCoins(amount, { label, icon })`, `spendCoins(amount, {...})`, balance selector
- Every coin change creates a **transaction** `{ id, type: 'earn'|'redeem', amount, label, icon, createdAt }`
- Wallet shows balance + transaction history (newest first, filterable)
- Coin values formatted `en-IN` (e.g., 1,20,000)

## 6. ⚠️ COIN PERSISTENCE + SYNC RULES (CRITICAL — get this right)
This is the highest-risk area. Implement **exactly** these rules:
- **Local-first**: every coin change saves to AsyncStorage immediately (with a `_localSavedAt` timestamp)
- **Cloud**: Firestore doc `users/{uid}/app/state` holds `{ coins, updatedAt, recentTxns }`
- **On login/hydration**: read BOTH cloud + local, use whichever has the **newer timestamp**
- **Cloud reads must be distinguishable**: a *missing doc* (new account) vs a *failed/timed-out read* are DIFFERENT
- **NEVER write coins to Firestore until a cloud read is CONFIRMED this session** (hydration succeeded, or a snapshot listener delivered a value). A fresh install whose read timed out must **never** overwrite a real cloud balance with 0
- **Realtime listener** (`onSnapshot`): only ever sync coins **UP** (apply remote only if `remote > local`) — a stale server value must never lower a locally-earned balance
- **Throttle cloud writes** (e.g., one every few minutes) + one authoritative write when the app goes to background
- Guests: local only, no cloud writes

## 7. REFERRAL SYSTEM
- Each user gets a unique **referral code** (short, uppercase, collision-safe) generated on signup
- Profile/Home shows the code + **Share** button (native share sheet) + copy-to-clipboard
- New user can enter a referral code once → both referrer and referee get a coin bonus
- Track referral stats (count + coins earned from referrals) shown on Profile
- Validate: no self-referral, one-time only, code must exist

## 8. DATA MODEL (Firestore)
```
users/{uid}                     → profile: name, email, photo, referCode, referredBy,
                                  coins (mirror), totalEarned, totalRedeemed, createdAt
users/{uid}/app/state           → { coins, recentTxns[], updatedAt }
config/app                      → remote config (feature flags, bonus amounts) — read-only for client
```
Add `firestore.rules` allowing a user to read/write only their own docs; `config/*` read-only.

## 9. REMOTE CONFIG (build this in from day 1)
Read `config/app` on launch for values like: daily bonus amount, referral bonus, min redeem. Fall back to sane in-code defaults if the fetch fails. **Never hardcode economy values in screens.**

## 10. FOLDER STRUCTURE
```
src/
  components/     reusable UI (Button, Card, CoinBadge, Header, EmptyState, Toast, Loader)
  context/        AuthContext, AppContext, ThemeContext(optional)
  navigation/     AppNavigator (tabs + stacks), custom TabBar
  screens/        HomeScreen, GamesScreen, WalletScreen, ProfileScreen, LoginScreen
  services/       firebase.js, firestoreStore.js (all Firestore reads/writes live here)
  utils/          theme.js, format.js, haptics.js, referral.js
App.js
```

## 11. REUSABLE COMPONENTS (build these)
`Button` (primary/secondary/ghost, loading + disabled states), `Card`, `CoinBadge`, `ScreenHeader`, `SectionHeader`, `EmptyState`, `Loader`, `Toast`. All theme-driven, all used by the screens.

## 12. QUALITY BAR ("professional, easy, smooth")
- Handle **loading / empty / error** states on every screen — no blank flashes
- **Safe-area** aware; no content under notches or the tab bar
- Subtle **haptics** on key actions; light, tasteful animations (no jank)
- Fast: memoize lists, avoid unnecessary re-renders, `FlatList` for long lists
- Comments only where non-obvious (why, not what)
- No dead code, no placeholder lorem, no TODOs left behind

## 13. OUT OF SCOPE (do NOT build now)
Ads/monetization, actual game logic, offerwalls, surveys, push notifications, admin dashboard, dark theme. Just leave clean, obvious extension points.

## 14. DELIVERABLES
1. Running Expo app, no console errors/warnings
2. All 4 tabs + Login working end-to-end
3. Google + Guest login, coins earn/spend, wallet history, referral code + share, profile stats
4. `firebase.js` config placeholders clearly marked for my keys
5. `firestore.rules` file
6. Short `README.md`: setup steps, Firebase config, run commands, folder map

## 15. BEFORE YOU START
Ask me only about genuine blockers (app name, Firebase project details, bonus amounts). Otherwise pick sensible defaults and proceed. Then build the whole foundation in one pass.
