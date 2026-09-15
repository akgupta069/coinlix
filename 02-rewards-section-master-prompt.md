# MASTER PROMPT — Rewards / Redeem Section

Build the complete **Rewards (Redeem) section** for this app. It must feel premium and be fully **dashboard-configurable** (no rebuild to change the catalog).

---

## 1. DATA MODEL
Each reward SKU:
```js
{
  id: 'ff_100',            // stable, never change (redeem flow depends on it)
  category: 'Free Fire',   // Free Fire | BGMI | GPRC | Vouchers
  label: 'Free Fire',      // brand
  sub: '100 Diamonds',     // denomination
  coins: 12500,            // coins required
  color: '#FF6B2B',        // brand accent
  icon: '💎',
  instant: false,          // true = immediate code delivery (no campaign)
  campaign: { ... }        // optional per-SKU override (see §5)
}
```

**Remote config**: read catalog from Firestore `config/rewards`:
```
config/rewards → { items: [ ...SKUs ], defaultCampaign: {...}, updatedAt }
```
Use the in-code catalog below as the **fallback default** until config loads. Never crash on a partially-filled entry — fill missing fields with defaults.

## 2. DEFAULT CATALOG (use exactly)

**Free Fire** — icon `💎`, color `#FF6B2B`
| id | sub | coins |
|---|---|---|
| ff_100 | 100 Diamonds | 12500 |
| ff_310 | 310 Diamonds | 18000 |
| ff_520 | 520 Diamonds | 22000 |
| ff_1060 | 1060 Diamonds | 28000 |
| ff_2180 | 2180 Diamonds | 36000 |
| ff_5600 | 5600 Diamonds | 52000 |

**BGMI** — icon `🎯`, color `#1A6ED4`
| id | sub | coins |
|---|---|---|
| bgmi_60 | 60 UC | 12500 |
| bgmi_180 | 180 UC | 18000 |
| bgmi_325 | 325 UC | 25000 |
| bgmi_660 | 660 UC | 30000 |
| bgmi_1800 | 1800 UC | 35000 |
| bgmi_3850 | 3850 UC | 60000 |

**GPRC (Google Play Redeem Code)** — label `Google Play`, icon `🎮`, color `#1DB954`
| id | sub | coins |
|---|---|---|
| gprc_10 | ₹10 Code | 12000 |
| gprc_250 | ₹250 Code | 20000 |
| gprc_500 | ₹500 Code | 25000 |
| gprc_1000 | ₹1000 Code | 30000 |
| gprc_2000 | ₹2000 Code | 40000 |
| gprc_5000 | ₹5000 Code | 60000 |

**Vouchers** — category `Vouchers`
| id | label | sub | coins | color | icon | instant |
|---|---|---|---|---|---|---|
| amz_10 | Amazon | ₹5 Voucher | 12000 | #FF9900 | 🛒 | **true** |
| amz_100 | Amazon | ₹100 Voucher | 20000 | #FF9900 | 🛒 | |
| amz_500 | Amazon | ₹500 Voucher | 30000 | #FF9900 | 🛒 | |
| amz_1000 | Amazon | ₹1000 Voucher | 50000 | #FF9900 | 🛒 | |
| fk_100 | Flipkart | ₹100 Gift Card | 15000 | #2874F0 | 🛍️ | |
| fk_500 | Flipkart | ₹500 Gift Card | 22000 | #2874F0 | 🛍️ | |
| fk_1000 | Flipkart | ₹1000 Gift Card | 36000 | #2874F0 | 🛍️ | |
| fk_2000 | Flipkart | ₹2000 Gift Card | 60000 | #2874F0 | 🛍️ | |
| myn_100 | Myntra | ₹100 Voucher | 15000 | #FF3F6C | 👗 | |
| myn_200 | Myntra | ₹200 Voucher | 20000 | #FF3F6C | 👗 | |
| myn_500 | Myntra | ₹500 Voucher | 24000 | #FF3F6C | 👗 | |
| myn_1000 | Myntra | ₹1000 Voucher | 36000 | #FF3F6C | 👗 | |

## 3. UI / UX
- **Category filter chips** (horizontal): `All 🎁 | GPRC 🎮 | Free Fire 🔥 | BGMI 🎯 | Vouchers 🛒`
- **Reward cards** (grid/list): brand icon in a tinted circle, label, denomination, coins-required pill, brand-color accent. Sort **ascending by coins**.
- **Instant SKUs** get a corner ribbon: **"⚡ INSTANT REDEEM"**
- Cards show an **affordable vs locked** visual state (locked = muted + 🔒)
- Coin amounts formatted `en-IN` (12,500)
- Everything from the theme — no hardcoded colors except brand accents from the SKU data
- Loading / empty states handled

## 4. THREE REDEEM FLOWS (based on state)

**A) Not enough coins → "Progress" modal**
- Show reward, coins needed, current coins, **progress bar (%)**, "You need X more coins"
- CTA: **"Earn More Coins"** → navigates Home

**B) Affordable + `instant: true` → Instant modal**
- Deduct coins → allocate a code **server-side** → show code with **Copy** + **Redeem on Amazon** buttons
- Handle errors: insufficient, out_of_stock, network — clear user-facing messages

**C) Affordable + normal → Campaign / Claim screen** (see §5)

## 5. CAMPAIGN SYSTEM (the "how to claim" flow)
Non-instant rewards show a campaign screen driven by config:
```js
campaign = {
  bannerEmoji: '🎁',
  bannerText: '',            // optional promo line (blank = hidden)
  title: 'PROCESS',
  steps: [ 'Click on Start Button', 'Install the partner app', '...' ],
  ctaLabel: 'START',
  ctaLink: 'https://...',    // partner offer link
  unlockDays: 2,             // code unlocks N days after Start
}
```
Resolution order: **`sku.campaign` → `config/rewards.defaultCampaign` → built-in default**

Screen behaviour:
- Header + banner emoji (+ banner text if set) + numbered **steps** list
- **START** button → opens `ctaLink`, records `startedAt` (first tap only, persisted per SKU)
- Before unlock: locked "🔒 REDEEM CODE" + note "unlocks in N days"
- After `unlockDays`: **"GET MY CODE"** → deduct coins → allocate code → show it
- Session rules: unused session expires after 3 days; once a code is shown it stays 3 hours then the flow resets
- **Instant SKUs never show a campaign**

## 6. CODE DELIVERY (server-side — no client trust)
- Codes are allocated by a **server endpoint** (Cloudflare Worker / Cloud Function), never picked client-side
- Server: verifies the user's ID token → checks balance → atomically allocates ONE unused code from a pool → marks it used (uid + timestamp) → deducts coins
- Client only shows the returned code + Copy/Redeem
- If the pool is empty → clean `out_of_stock` message
- **Stub this endpoint** for now if the backend isn't ready, but keep the client contract exactly as above

## 7. RULES
- Coins deducted **only** on successful code allocation; write a `redeem` transaction `{ label, sub, coins, icon }`
- **Google login required** to redeem (guests: prompt to sign in)
- Never let a redeem go through with insufficient coins (check client AND server)
- All state (started/claimed) persisted per-SKU so it survives app restarts

## 8. OUT OF SCOPE
Admin dashboard UI, ads, real code inventory. Just leave the config + server contract clean.

## 9. DELIVERABLE
Rewards tab fully working: catalog + filters + 3 flows + campaign screen + config-driven catalog, theme-consistent, no console errors.

---

## NOTES (from Tapzo experience)
- The coin values above are Tapzo's numbers — decide YOUR economy ("how many ads/games per reward") first, then adjust.
- Server-side code allocation is essential — never expose codes in the client (users reverse-engineer the APK).
