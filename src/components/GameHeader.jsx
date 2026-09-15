import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../utils/theme';
import { tapLight } from '../utils/haptics';

export default function GameHeader({ title, right = null }) {
  const navigation = useNavigation();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => {
          tapLight();
          navigation.goBack();
        }}
        hitSlop={12}
        style={styles.backBtn}
      >
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <Text style={[Typography.h3, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.text, marginTop: -2 },
  title: { flex: 1 },
  right: { minWidth: 24, alignItems: 'flex-end' },
});
