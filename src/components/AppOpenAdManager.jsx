import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { getAppOpenAdUnitId } from '../services/ads';
import { isAppOpenAdSuppressed } from '../services/adGate';
import { trackAdImpression } from '../services/metaEvents';

const appOpenAd = AppOpenAd.createForAdRequest(getAppOpenAdUnitId());
const OWN_CLOSE_COOLDOWN_MS = 2000;

// Mounted once at the app root. Preloads an app open ad and shows it on cold
// start and every time the app returns to the foreground.
export default function AppOpenAdManager() {
  const loadedRef = useRef(false);
  const showingRef = useRef(false);
  const lastCloseAtRef = useRef(0);

  useEffect(() => {
    const unsubLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      showingRef.current = false;
      lastCloseAtRef.current = Date.now();
      appOpenAd.load();
    });
    const unsubError = appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
      showingRef.current = false;
    });
    const unsubPaid = appOpenAd.addAdEventListener(AdEventType.PAID, (p) => {
      trackAdImpression(p?.value, p?.currency, 'app_open');
    });
    appOpenAd.load();

    const showIfReady = () => {
      if (isAppOpenAdSuppressed()) return;
      if (Date.now() - lastCloseAtRef.current < OWN_CLOSE_COOLDOWN_MS) return;
      if (loadedRef.current && !showingRef.current) {
        showingRef.current = true;
        appOpenAd.show().catch(() => {
          showingRef.current = false;
        });
      }
    };

    // Cold start — give the first load a moment before trying to show it.
    const coldStartTimer = setTimeout(showIfReady, 3000);

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') showIfReady();
    });

    return () => {
      clearTimeout(coldStartTimer);
      unsubLoaded();
      unsubClosed();
      unsubError();
      unsubPaid();
      appStateSub.remove();
    };
  }, []);

  return null;
}
