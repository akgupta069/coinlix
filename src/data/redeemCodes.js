// Redeem-code giveaway config. Denominations are the rupee face value of the
// card; the coin price is derived from the app's coin rate so the two can never
// drift apart. Actual codes are NOT stored in the app — a redeem hands the user
// off to DELIVERY_LINK, which is where the code is issued. Denominations and the
// delivery link can be overridden from Firestore (config/redeemCodes) without an
// app update; the defaults below are what ships as a fallback. A card is
// claimable purely on the user's coin balance — there is no stock counter.

// The app-wide coin rate. Every rupee figure in the UI derives from this, so
// changing it here changes the whole economy consistently.
export const COINS_PER_INR = 100;

export const DELIVERY_LINK = 'https://hai8g.com/4/9326277';

const DENOMINATIONS = [100, 200, 500, 1000, 2000, 5000];

export const DEFAULT_REDEEM_CARDS = DENOMINATIONS.map((inr) => ({
  id: `gp_${inr}`,
  brand: 'Google Play',
  sub: 'Gift Card',
  inr,
  coins: inr * COINS_PER_INR,
}));

// Fills gaps on a partially-configured remote entry so the UI never crashes.
export function normalizeRedeemCard(raw) {
  const inr = Number(raw?.inr) || 0;
  return {
    id: raw?.id || `gp_${inr}`,
    brand: raw?.brand || 'Google Play',
    sub: raw?.sub || 'Gift Card',
    inr,
    coins: Number.isFinite(raw?.coins) ? raw.coins : inr * COINS_PER_INR,
  };
}
