import React, { useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import AdRewardModal from '../../components/AdRewardModal';
import Button from '../../components/Button';
import CoinBadge from '../../components/CoinBadge';
import { Colors, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { tapMedium } from '../../utils/haptics';

const SEGMENTS = [10, 20, 40, 60, 100, 150, 200];
const SEGMENT_COLORS = ['#6C5CE7', '#00C2A8', '#F5A623', '#F0483E', '#4B3FCB', '#20C46A', '#F5B60A'];
const SIZE = 280;
const RADIUS = SIZE / 2;
const STEP = 360 / SEGMENTS.length;

function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function SpinWheelScreen() {
  const { coins, addCoins } = useApp();
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationValueRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showAd, setShowAd] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const centerAngle = winningIndex * STEP + STEP / 2;
    const currentMod = rotationValueRef.current % 360;
    const targetMod = (360 - centerAngle + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;
    const totalRotation = rotationValueRef.current + 5 * 360 + delta;

    tapMedium();
    Animated.timing(rotation, {
      toValue: totalRotation,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotationValueRef.current = totalRotation;
      setSpinning(false);
      setResult(SEGMENTS[winningIndex]);
    });
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Lucky Spin" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>7 segments · up to 1,000 coins</Text>

        <View style={styles.wheelWrap}>
          <View style={styles.pointer} />
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {SEGMENTS.map((value, i) => {
                const start = i * STEP;
                const end = start + STEP;
                const mid = start + STEP / 2;
                const labelPos = polarToCartesian(RADIUS, RADIUS, RADIUS * 0.62, mid);
                return (
                  <React.Fragment key={i}>
                    <Path d={describeSlice(RADIUS, RADIUS, RADIUS - 4, start, end)} fill={SEGMENT_COLORS[i]} stroke="#fff" strokeWidth={2} />
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="#fff"
                      fontSize={16}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {value}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              <Circle cx={RADIUS} cy={RADIUS} r={RADIUS - 2} fill="none" stroke={Colors.surface} strokeWidth={4} />
            </Svg>
          </Animated.View>
        </View>

        {result !== null && !spinning ? (
          <Text style={styles.resultText}>You landed on {formatCoins(result)} coins!</Text>
        ) : null}

        <Button
          title={spinning ? 'Spinning…' : result !== null ? 'Watch Ad to Claim' : 'SPIN'}
          onPress={result !== null ? () => setShowAd(true) : spin}
          disabled={spinning}
          style={styles.spinBtn}
        />
      </View>

      <AdRewardModal
        visible={showAd}
        coins={result || 0}
        rewardLabel="Spin reward!"
        onClaim={() => addCoins(result, { label: 'Lucky Spin', icon: '🎡' })}
        onClose={() => {
          setShowAd(false);
          setResult(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  hint: { color: Colors.textMuted, marginBottom: Spacing.lg },
  wheelWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.text,
    zIndex: 2,
    marginBottom: -8,
  },
  resultText: { ...Typography.h3, color: Colors.success, marginBottom: Spacing.md, textAlign: 'center' },
  spinBtn: { alignSelf: 'stretch', marginTop: Spacing.md },
});
