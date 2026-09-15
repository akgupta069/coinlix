import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Real AdMob rewarded ad unit IDs — replace these once the AdMob app/ad-unit
// is created (Apps > CoinLix > Ad units > Rewarded). Falls back to Google's
// public test unit IDs so the app builds and shows ads before that's done.
const REWARDED_AD_UNIT_ID = {
  android: 'ca-app-pub-3712414184705571/2580569445',
  ios: null,
};

const INTERSTITIAL_AD_UNIT_ID = {
  android: 'ca-app-pub-3712414184705571/8051090808',
  ios: null,
};

const APP_OPEN_AD_UNIT_ID = {
  android: 'ca-app-pub-3712414184705571/3508481610',
  ios: null,
};

export const getRewardedAdUnitId = () => {
  const configured = Platform.OS === 'ios' ? REWARDED_AD_UNIT_ID.ios : REWARDED_AD_UNIT_ID.android;
  return configured || TestIds.REWARDED;
};

export const getInterstitialAdUnitId = () => {
  const configured = Platform.OS === 'ios' ? INTERSTITIAL_AD_UNIT_ID.ios : INTERSTITIAL_AD_UNIT_ID.android;
  return configured || TestIds.INTERSTITIAL;
};

export const getAppOpenAdUnitId = () => {
  const configured = Platform.OS === 'ios' ? APP_OPEN_AD_UNIT_ID.ios : APP_OPEN_AD_UNIT_ID.android;
  return configured || TestIds.APP_OPEN;
};
