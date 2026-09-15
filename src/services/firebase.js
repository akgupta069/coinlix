import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBvWSC0SebPQu5eiKPAMRzMo4Ptwozf2VA',
  authDomain: 'coinlix-9c50b.firebaseapp.com',
  projectId: 'coinlix-9c50b',
  storageBucket: 'coinlix-9c50b.firebasestorage.app',
  messagingSenderId: '460317068613',
  appId: '1:460317068613:web:1b9d8326a7fb36440bc22c',
};

export const GOOGLE_WEB_CLIENT_ID =
  '460317068613-uqn4afoe8eacrv44n008o13fdumdb4gs.apps.googleusercontent.com';

// Android OAuth client tied to the Play App Signing certificate — used for
// the browser-based (expo-auth-session) Google sign-in flow instead of the
// native @react-native-google-signin module. This is what real Play Store
// installs (testers + production) are signed with, so it must stay pointed
// here. The other Android client (upload-keystore cert, used for local
// sideload builds) was accidentally deleted from Cloud Console and needs to
// be recreated separately if local/emulator testing is needed again.
export const GOOGLE_ANDROID_CLIENT_ID =
  '460317068613-slp262tb2jaa8p1gbc7esp3jmsm4sbqr.apps.googleusercontent.com';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
