import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import GameThumbnailCard from '../components/GameThumbnailCard';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import games from '../data/games';

export default function GamesScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GameThumbnailCard
            game={item}
            onPress={() => navigation.navigate(item.route)}
            style={styles.card}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🎮</Text>
            <View style={styles.flex1}>
              <Text style={styles.headerTitle}>Play & Earn</Text>
              <Text style={styles.headerSubtitle}>{games.length} games · Free to play</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.adSlot}>
            <Text style={styles.adLabel}>SPONSORED</Text>
            <Text style={[Typography.small, styles.adText]}>
              Ad slot — connects to a real ad network later
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  list: { padding: Spacing.lg, paddingTop: Spacing.sm },
  row: { gap: Spacing.sm },
  card: { marginBottom: Spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerIcon: { fontSize: 26 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  headerSubtitle: { ...Typography.small, color: Colors.textMuted, marginTop: 2 },
  adSlot: {
    marginTop: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  adLabel: { ...Typography.caption, color: Colors.textMuted, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  adText: { color: Colors.textMuted },
});
