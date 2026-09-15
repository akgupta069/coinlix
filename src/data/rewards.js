// Default reward catalog — used until config/rewards loads from Firestore
// (see services/firestoreStore.readRewardsConfig). Never edit SKU ids once
// shipped; the redeem flow and per-SKU local state are keyed by id.

const FREE_FIRE = [
  { id: 'ff_100', sub: '100 Diamonds', coins: 12500 },
  { id: 'ff_310', sub: '310 Diamonds', coins: 18000 },
  { id: 'ff_520', sub: '520 Diamonds', coins: 22000 },
  { id: 'ff_1060', sub: '1060 Diamonds', coins: 28000 },
  { id: 'ff_2180', sub: '2180 Diamonds', coins: 36000 },
  { id: 'ff_5600', sub: '5600 Diamonds', coins: 52000 },
].map((sku) => ({ ...sku, category: 'Free Fire', label: 'Free Fire', color: '#FF6B2B', icon: '💎', instant: false }));

const BGMI = [
  { id: 'bgmi_60', sub: '60 UC', coins: 12500 },
  { id: 'bgmi_180', sub: '180 UC', coins: 18000 },
  { id: 'bgmi_325', sub: '325 UC', coins: 25000 },
  { id: 'bgmi_660', sub: '660 UC', coins: 30000 },
  { id: 'bgmi_1800', sub: '1800 UC', coins: 35000 },
  { id: 'bgmi_3850', sub: '3850 UC', coins: 60000 },
].map((sku) => ({ ...sku, category: 'BGMI', label: 'BGMI', color: '#1A6ED4', icon: '🎯', instant: false }));

const GPRC = [
  { id: 'gprc_10', sub: '₹10 Code', coins: 12000 },
  { id: 'gprc_250', sub: '₹250 Code', coins: 20000 },
  { id: 'gprc_500', sub: '₹500 Code', coins: 25000 },
  { id: 'gprc_1000', sub: '₹1000 Code', coins: 30000 },
  { id: 'gprc_2000', sub: '₹2000 Code', coins: 40000 },
  { id: 'gprc_5000', sub: '₹5000 Code', coins: 60000 },
].map((sku) => ({ ...sku, category: 'GPRC', label: 'Google Play', color: '#1DB954', icon: '🎮', instant: false }));

const VOUCHERS = [
  { id: 'amz_10', label: 'Amazon', sub: '₹5 Voucher', coins: 12000, color: '#FF9900', icon: '🛒', instant: true },
  { id: 'amz_100', label: 'Amazon', sub: '₹100 Voucher', coins: 20000, color: '#FF9900', icon: '🛒', instant: false },
  { id: 'amz_500', label: 'Amazon', sub: '₹500 Voucher', coins: 30000, color: '#FF9900', icon: '🛒', instant: false },
  { id: 'amz_1000', label: 'Amazon', sub: '₹1000 Voucher', coins: 50000, color: '#FF9900', icon: '🛒', instant: false },
  { id: 'fk_100', label: 'Flipkart', sub: '₹100 Gift Card', coins: 15000, color: '#2874F0', icon: '🛍️', instant: false },
  { id: 'fk_500', label: 'Flipkart', sub: '₹500 Gift Card', coins: 22000, color: '#2874F0', icon: '🛍️', instant: false },
  { id: 'fk_1000', label: 'Flipkart', sub: '₹1000 Gift Card', coins: 36000, color: '#2874F0', icon: '🛍️', instant: false },
  { id: 'fk_2000', label: 'Flipkart', sub: '₹2000 Gift Card', coins: 60000, color: '#2874F0', icon: '🛍️', instant: false },
  { id: 'myn_100', label: 'Myntra', sub: '₹100 Voucher', coins: 15000, color: '#FF3F6C', icon: '👗', instant: false },
  { id: 'myn_200', label: 'Myntra', sub: '₹200 Voucher', coins: 20000, color: '#FF3F6C', icon: '👗', instant: false },
  { id: 'myn_500', label: 'Myntra', sub: '₹500 Voucher', coins: 24000, color: '#FF3F6C', icon: '👗', instant: false },
  { id: 'myn_1000', label: 'Myntra', sub: '₹1000 Voucher', coins: 36000, color: '#FF3F6C', icon: '👗', instant: false },
].map((sku) => ({ ...sku, category: 'Vouchers' }));

export const DEFAULT_CATALOG = [...GPRC, ...FREE_FIRE, ...BGMI, ...VOUCHERS];

export const CATEGORIES = [
  { key: 'All', label: 'All', emoji: '🎁' },
  { key: 'GPRC', label: 'GPRC', emoji: '🎮' },
  { key: 'Free Fire', label: 'Free Fire', emoji: '🔥' },
  { key: 'BGMI', label: 'BGMI', emoji: '🎯' },
  { key: 'Vouchers', label: 'Vouchers', emoji: '🛒' },
];

export const DEFAULT_CAMPAIGN = {
  bannerEmoji: '🎁',
  bannerText: '',
  title: 'PROCESS',
  steps: [
    'Tap the START button below',
    'Complete the partner offer',
    'Come back and wait for it to unlock',
    'Tap GET MY CODE to reveal your reward',
  ],
  ctaLabel: 'START',
  ctaLink: 'https://example.com/offer',
  unlockDays: 2,
};

// Fills gaps on a partially-configured remote SKU so the UI never crashes.
export function normalizeSku(raw) {
  return {
    id: raw.id,
    category: raw.category || 'Vouchers',
    label: raw.label || raw.category || 'Reward',
    sub: raw.sub || '',
    coins: Number.isFinite(raw.coins) ? raw.coins : 0,
    color: raw.color || '#6C5CE7',
    icon: raw.icon || '🎁',
    instant: !!raw.instant,
    campaign: raw.campaign || null,
  };
}

const BRAND_LINKS = {
  Amazon: 'https://www.amazon.in',
  Flipkart: 'https://www.flipkart.com',
  Myntra: 'https://www.myntra.com',
  'Google Play': 'https://play.google.com/store',
};

export function brandLinkFor(label) {
  return BRAND_LINKS[label] || null;
}
