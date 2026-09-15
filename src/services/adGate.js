// Shared guard so a rewarded/interstitial ad closing doesn't trigger the
// App Open ad through the AppState 'active' transition that follows it.
let suppressed = false;
let clearTimer = null;

export const beginSuppressingAppOpenAd = () => {
  suppressed = true;
  if (clearTimer) clearTimeout(clearTimer);
};

export const endSuppressingAppOpenAd = (delayMs = 1500) => {
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    suppressed = false;
  }, delayMs);
};

export const isAppOpenAdSuppressed = () => suppressed;
