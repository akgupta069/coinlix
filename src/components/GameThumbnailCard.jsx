import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GameArt from './art/GameArt';
import { Radius, Shadows } from '../utils/theme';
import { tapLight } from '../utils/haptics';

export default function GameThumbnailCard({ game, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const shineX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineX, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(shineX, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shineX]);

  const translateX = shineX.interpolate({ inputRange: [-1, 1], outputRange: [-140, 140] });

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start()}
      onPress={() => {
        tapLight();
        onPress();
      }}
      style={[
        styles.wrap,
        { shadowColor: game.gradient[0], shadowOpacity: 0.45, shadowRadius: 12, elevation: 7 },
        style,
      ]}
    >
      <Animated.View style={[styles.inner, { transform: [{ scale }] }]}>
        <LinearGradient colors={game.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.art}>
          <View style={styles.artBox}>
            <GameArt name={game.art || game.id} />
          </View>

          {/* Scrim keeps the title readable over the brighter illustrations. */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
            style={styles.titleScrim}
            pointerEvents="none"
          />
          <Text style={styles.name} numberOfLines={2}>{game.name}</Text>

          <Animated.View
            style={[styles.shine, { transform: [{ translateX }, { rotate: '25deg' }] }]}
            pointerEvents="none"
          />
        </LinearGradient>

        <View style={[styles.playBar, { backgroundColor: game.gradient[1] }]}>
          <View style={styles.playIconWrap}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <Text style={styles.playText}>PLAY</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '31%', aspectRatio: 0.86, borderRadius: Radius.xl, overflow: 'hidden', ...Shadows.card },
  inner: { flex: 1 },
  art: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingHorizontal: 5,
    overflow: 'hidden',
  },
  artBox: { flex: 1, width: '82%', alignSelf: 'center' },
  titleScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40 },
  name: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  shine: {
    position: 'absolute',
    top: -30,
    width: 60,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  playBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8 },
  playIconWrap: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 8, color: '#fff' },
  playText: { fontSize: 13, color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
});
