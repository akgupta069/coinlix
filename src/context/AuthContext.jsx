import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from 'firebase/auth';

import { auth, GOOGLE_ANDROID_CLIENT_ID } from '../services/firebase';
import { ensureUserProfile } from '../services/firestoreStore';
import { logSignUp } from '../services/metaEvents';

// Required once at module scope so the in-app browser tab correctly closes
// and resolves promptAsync() when Google redirects back to the app.
WebBrowser.maybeCompleteAuthSession();

const GUEST_FLAG_KEY = 'coinlix_guest_mode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // The Android flow exchanges the auth code for tokens asynchronously, so
  // the id_token shows up on `response` (not on promptAsync()'s resolved
  // value) once the exchange completes.
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setError('Google sign-in did not return a token. Please try again.');
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken);
      setAuthLoading(true);
      signInWithCredential(auth, credential)
        .then(() => logSignUp('google'))
        .catch((firebaseError) => {
          setAuthLoading(false);
          setError(`Could not sign in to CoinLix (${firebaseError.code || firebaseError.message}).`);
        });
    } else if (response.type === 'error') {
      setError('Google sign-in failed. Please try again.');
    }
  }, [response]);

  // Restore guest flag + listen for Firebase auth changes
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const savedGuest = await AsyncStorage.getItem(GUEST_FLAG_KEY);
      unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsGuest(false);
          await AsyncStorage.removeItem(GUEST_FLAG_KEY);
          try {
            const p = await ensureUserProfile(firebaseUser.uid, {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              photo: firebaseUser.photoURL,
            });
            setProfile(p);
          } catch (e) {
            setError('Could not load your profile. Check your connection.');
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsGuest(savedGuest === 'true');
        }
        setAuthLoading(false);
      });
    })();
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await promptAsync();
      // Success/error handling happens in the effect above once `response` updates.
    } catch (e) {
      setError(`Google sign-in failed: ${e?.message || 'unknown error'}.`);
    }
  };

  const continueAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_FLAG_KEY, 'true');
    setIsGuest(true);
  };

  const signOutUser = async () => {
    await AsyncStorage.removeItem(GUEST_FLAG_KEY);
    setIsGuest(false);
    if (user) {
      await signOut(auth);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      setProfile,
      isGuest,
      isLoggedIn: !!user,
      authLoading,
      error,
      clearError: () => setError(null),
      canSignInWithGoogle: !!request,
      signInWithGoogle,
      continueAsGuest,
      signOutUser,
    }),
    [user, profile, isGuest, authLoading, error, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
