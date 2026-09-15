import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../utils/theme';

export default function Loader({ fullscreen = true }) {
  return (
    <View style={[styles.wrap, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  fullscreen: { flex: 1, backgroundColor: Colors.background },
});
