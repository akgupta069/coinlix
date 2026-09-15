import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { tapLight } from '../utils/haptics';

const TAB_META = {
  Home: { label: 'Home', icon: '🏠' },
  Games: { label: 'Games', icon: '🎮' },
  Wallet: { label: 'Wallet', icon: '👛' },
  Profile: { label: 'Profile', icon: '👤' },
};

export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const meta = TAB_META[route.name] || { label: route.name, icon: '•' };

        const onPress = () => {
          tapLight();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab} hitSlop={4}>
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Text style={styles.icon}>{meta.icon}</Text>
            </View>
            <Text style={[Typography.caption, isFocused && styles.labelActive]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    ...Shadows.floating,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: Colors.surfaceAlt },
  icon: { fontSize: 18 },
  labelActive: { color: Colors.primary, fontWeight: '700' },
});
