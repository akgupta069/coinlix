// Reward code allocation — client contract only. The real implementation
// MUST live server-side (Cloud Function / Cloudflare Worker): verify the
// user's ID token, check their balance, atomically pull ONE unused code
// from a per-SKU inventory pool, mark it used, and return it. Never let the
// client pick or generate a code itself — the APK can be reverse-engineered.
//
// This is a stub (no real code inventory exists yet — out of scope per the
// rewards master prompt). It always succeeds so the rest of the flow can be
// built and tested; swap the body for a real fetch() to your endpoint later
// without touching any caller.

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generatePlaceholderCode(skuId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = skuId.split('_')[0].toUpperCase();
  let body = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) body += '-';
    body += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${body}`;
}

/**
 * Returns { ok: true, code } on success or { ok: false, error } where error
 * is one of 'out_of_stock' | 'network_error'.
 */
export async function allocateRewardCode(sku) {
  await delay(1100);
  return { ok: true, code: generatePlaceholderCode(sku.id) };
}
