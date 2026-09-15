import { AppEventsLogger } from 'react-native-fbsdk-next';

// Thin wrapper around Meta's App Events logging, used for Meta Ads
// attribution/optimization (install -> sign_up -> game_played -> reward).
export const logSignUp = (method) => {
  AppEventsLogger.logEvent('sign_up', { method });
};

export const logGamePlayed = (gameName) => {
  AppEventsLogger.logEvent('game_played', { game_name: gameName });
};

export const logRewardClaimed = (coins, gameName) => {
  AppEventsLogger.logEvent('first_reward_claimed', coins, { game_name: gameName });
};

// AdMob's impression-level ad revenue (PAID event) forwarded as Meta's standard
// "AdImpression" value event. This is what powers Meta's
// "Maximize value of conversions → In-app ad impression" optimization, so the
// event name and the positional value argument must stay exactly as-is.
// Zero/invalid values are dropped — they pollute the unique-value signal Meta
// uses to decide eligibility.
export const trackAdImpression = (value, currency, adType) => {
  const amount = Number(value);
  if (!(amount > 0)) return;
  try {
    AppEventsLogger.logEvent('AdImpression', amount, {
      fb_currency: currency || 'USD',
      ad_type: adType || 'unknown',
      ad_platform: 'admob',
    });
  } catch (e) {
    // Never let analytics break ad display.
  }
};
