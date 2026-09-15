import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { DEFAULT_CATALOG } from '../data/rewards';

const SHOW_INTERVAL_MS = 10000;
const VISIBLE_DURATION_MS = 3200;

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Pooja', 'Rohit', 'Neha',
  'Karan', 'Anjali', 'Suresh', 'Divya', 'Manish', 'Kavita', 'Arjun', 'Riya',
  'Deepak', 'Shreya', 'Vivek', 'Anita', 'Gaurav', 'Meena', 'Sandeep', 'Nisha',
  'Ravi', 'Swati', 'Ajay', 'Komal', 'Yash', 'Preeti',
];
const LAST_INITIALS = ['A.', 'B.', 'C.', 'D.', 'G.', 'K.', 'M.', 'P.', 'R.', 'S.', 'T.', 'V.'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRedemption() {
  const sku = randomFrom(DEFAULT_CATALOG);
  const name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_INITIALS)}`;
  return { name, icon: sku.icon, reward: `${sku.label} ${sku.sub}` };
}

export default function SocialProofToast() {
  const insets = useSafeAreaInsets();
  const [entry, setEntry] = useState(null);
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let hideTimer;
    const intervalId = setInterval(() => {
      setEntry(randomRedemption());
      translateY.setValue(-80);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();

      hideTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -80, duration: 220, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start(() => setEntry(null));
      }, VISIBLE_DURATION_MS);
    }, SHOW_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      clearTimeout(hideTimer);
    };
  }, [translateY, opacity]);

  if (!entry) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + Spacing.sm, opacity, transform: [{ translateY }] }]}
    >
      <Text style={styles.icon}>{entry.icon}</Text>
      <Text style={styles.text} numberOfLines={1}>
        <Text style={styles.name}>{entry.name}</Text> just redeemed{' '}
        <Text style={styles.reward}>{entry.reward}</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.text,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    ...Shadows.floating,
  },
  icon: { fontSize: 18 },
  text: { ...Typography.small, color: Colors.white, flexShrink: 1 },
  name: { fontWeight: '800', color: Colors.white },
  reward: { fontWeight: '800', color: '#FFD700' },
});
