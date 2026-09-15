import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import ToastHost from './src/components/Toast';
import IntervalInterstitialAd from './src/components/IntervalInterstitialAd';
import AppOpenAdManager from './src/components/AppOpenAdManager';
import SocialProofToast from './src/components/SocialProofToast';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <AppNavigator />
          <ToastHost />
          <IntervalInterstitialAd />
          <AppOpenAdManager />
          <SocialProofToast />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
