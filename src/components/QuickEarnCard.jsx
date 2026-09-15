import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QuickEarnArt from './art/QuickEarnArt';
import { Radius, Spacing, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { tapLight } from '../utils/haptics';

export default function QuickEarnCard({ item, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  // The illustration breathes gently instead of the old pulsing glow behind it.
  const artScale = float.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  const isCoins = item.badge.type === 'coins';

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start()}
      onPress={() => {
        tapLight();
        onPress();
      }}
      style={[
        styles.wrap,
        { shadowColor: item.gradient[0], shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
        style,
      ]}
    >
      <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View style={[styles.artBox, { transform: [{ scale: artScale }] }]}>
            <QuickEarnArt name={item.art || item.id} />
          </Animated.View>

          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {isCoins ? `🪙 ${formatCoins(item.badge.value)}` : `✅ ${item.badge.text}`}
            </Text>
          </View>

          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '31%', minWidth: 90, aspectRatio: 0.95, borderRadius: Radius.lg, ...Shadows.card },
  gradient: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  artBox: { flex: 1, width: '78%', alignSelf: 'center' },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 4,
    maxWidth: '100%',
  },
  badgeText: { fontSize: 10.5, fontWeight: '800', color: '#1B1D29' },
  name: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
