import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoritesStore } from '@/store/favoritesStore';
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

  const handleExercisePress = (exercise: Exercise) => {
    router.push({
      pathname: '/exercise/[id]',
      params: { id: exercise.id },
    });
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typography.title1, { color: colors.text }]}>
          {t.favoritesTitle}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          {favorites.length} {t.exercises} {t.favoritesCountSubtitle}
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.gridColumn}>
            <ExerciseCard
              exercise={item}
              index={index}
              onPress={() => handleExercisePress(item)}
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
