import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '../services/ads';
import { beginSuppressingAppOpenAd, endSuppressingAppOpenAd } from '../services/adGate';
import { trackAdImpression } from '../services/metaEvents';

const SHOW_INTERVAL_MS = 3 * 60 * 1000;

const interstitial = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());

// Mounted once at the app root. Preloads an interstitial and shows it every
// 3 minutes while the app is in the foreground, reloading after each show.
export default function IntervalInterstitialAd() {
  const loadedRef = useRef(false);

  useEffect(() => {
    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      interstitial.load();
      endSuppressingAppOpenAd();
    });
    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
      endSuppressingAppOpenAd();
    });
    const unsubPaid = interstitial.addAdEventListener(AdEventType.PAID, (p) => {
      trackAdImpression(p?.value, p?.currency, 'interstitial');
    });
    interstitial.load();

    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active' && loadedRef.current) {
        beginSuppressingAppOpenAd();
        interstitial.show();
      }
    }, SHOW_INTERVAL_MS);

    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
      unsubPaid();
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
