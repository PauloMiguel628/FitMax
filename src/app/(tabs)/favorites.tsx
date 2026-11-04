import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoritesStore } from '@/store/favoritesStore';
import { ExerciseService } from '@/services/exerciseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Exercise } from '@/types';
import { useTranslation } from '@/i18n';

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography } = useAppTheme();
  const { t } = useTranslation();
  const favorites = useFavoritesStore((state) => state.favorites);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const resolvedFavorites = useMemo(() => {
    const seen = new Set<string>();
    const list: Exercise[] = [];

    for (const fav of favorites) {
      const id = String(fav.id);
      if (favoriteIds[id] !== false && !seen.has(id)) {
        seen.add(id);
        list.push(fav);
      }
    }

    const catalog = ExerciseService.getInitialExercises();
    for (const ex of catalog) {
      const id = String(ex.id);
      if (favoriteIds[id] && !seen.has(id)) {
        seen.add(id);
        list.push(ex);
      }
    }

    return list;
  }, [favorites, favoriteIds]);

  const handleExercisePress = useCallback(
    (exercise: Exercise) => {
      router.push({
        pathname: '/exercise/[id]',
        params: { id: exercise.id },
      });
    },
    [router]
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typography.title1, { color: colors.text }]}>
          {t.favoritesTitle}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          {resolvedFavorites.length} {t.exercises} {t.favoritesCountSubtitle}
        </Text>
      </View>

      <FlatList
        data={resolvedFavorites}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        updateCellsBatchingPeriod={16}
        removeClippedSubviews={Platform.OS === 'android'}
        renderItem={({ item, index }) => (
          <View style={styles.gridColumn}>
            <ExerciseCard
              exercise={item}
              index={index}
              onSelectExercise={handleExercisePress}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title={t.favoritesEmpty}
            subtitle={t.favoritesEmptySubtitle}
            actionTitle={t.exploreExercises}
            onAction={() => router.push('/(tabs)')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 12,
    flexGrow: 1,
  },
  gridColumn: {
    width: '50%',
    paddingHorizontal: 2,
  },
});
