import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';

let showHandler = null;

export function showToast(message, type = 'default') {
  showHandler?.(message, type);
}

const TYPE_COLORS = {
  default: Colors.text,
  success: Colors.success,
  error: Colors.danger,
};

export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    showHandler = (message, type) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast({ message, type });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timeoutRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
          setToast(null)
        );
      }, 2200);
    };
    return () => {
      showHandler = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [opacity]);

  if (!toast) return null;

  return (
    <Animated.View style={[styles.wrap, { top: insets.top + Spacing.sm, opacity }]}>
      <Text style={[styles.text, { borderLeftColor: TYPE_COLORS[toast.type] }]} numberOfLines={2}>
        {toast.message}
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
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  text: {
    ...Typography.small,
    color: Colors.white,
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
  },
});
