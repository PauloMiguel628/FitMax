import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '@/types';
import { ExerciseService } from '@/services/exerciseService';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ACTIVE_CATEGORIES, CATEGORY_METADATA, matchesExerciseCategory } from '@/config/home-friendly';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getLocalizedExerciseName, getLocalizedTarget } from '@/utils/exerciseLocalization';
import { useTranslation } from '@/i18n';

export default function TimerSelectorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const favorites = useFavoritesStore((state) => state.favorites);

  useEffect(() => {
    ExerciseService.getAllExercises().then(setExercises);
  }, []);

  const filteredExercises = useMemo(() => {
    let list = onlyFavorites ? favorites : exercises;

    if (selectedCategory !== 'all') {
      list = list
        .filter((ex) => matchesExerciseCategory(ex, selectedCategory))
        .sort((a, b) => {
          const aPri = (a.bodyPart || '').toLowerCase() === selectedCategory ? 0 : 1;
          const bPri = (b.bodyPart || '').toLowerCase() === selectedCategory ? 0 : 1;
          return aPri - bPri;
        });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((ex) => {
        const ptName = getLocalizedExerciseName(ex.name, locale).toLowerCase();
        const ptTarget = getLocalizedTarget(ex.target, locale).toLowerCase();
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.target.toLowerCase().includes(q) ||
          ptName.includes(q) ||
          ptTarget.includes(q)
        );
      });
    }

    return list;
  }, [exercises, favorites, selectedCategory, onlyFavorites, searchQuery, locale]);

  const handleSelectExercise = (exercise: Exercise) => {
    router.push({
      pathname: '/exercise-timer/[id]',
      params: { id: exercise.id },
    });
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <Text style={[typography.title1, { color: colors.text }]}>
          {t.timerTitle}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          {t.timerSelectPrompt}
        </Text>

        {/* Campo de Busca */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderRadius: radius.full,
              marginTop: spacing.md,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.timerSearchPlaceholder}
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, typography.bodyMedium, { color: colors.text }]}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Chips de filtro: Atalho Favoritos + Categorias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsContainer, { paddingVertical: spacing.md }]}
        >
          {/* Botão de Atalho para Favoritos */}
          <Pressable
            onPress={() => setOnlyFavorites(!onlyFavorites)}
            style={[
              styles.chip,
              {
                borderRadius: radius.full,
                backgroundColor: onlyFavorites ? colors.primary : colors.surfaceElevated,
                borderColor: onlyFavorites ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={onlyFavorites ? 'heart' : 'heart-outline'}
              size={16}
              color={onlyFavorites ? '#FFFFFF' : colors.primary}
            />
            <Text
              style={[
                typography.label,
                styles.chipText,
                { color: onlyFavorites ? '#FFFFFF' : colors.text },
              ]}
            >
              {t.favoritesTitle}
            </Text>
          </Pressable>

          {/* Opção Todos */}
          <Pressable
            onPress={() => {
              setSelectedCategory('all');
              setOnlyFavorites(false);
            }}
            style={[
              styles.chip,
              {
                borderRadius: radius.full,
                backgroundColor:
                  !onlyFavorites && selectedCategory === 'all'
                    ? colors.primary
                    : colors.surfaceElevated,
                borderColor:
                  !onlyFavorites && selectedCategory === 'all'
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                typography.label,
                styles.chipText,
                {
                  color:
                    !onlyFavorites && selectedCategory === 'all'
                      ? '#FFFFFF'
                      : colors.text,
                },
              ]}
            >
              {t.all}
            </Text>
          </Pressable>

          {/* Categorias Ativas */}
          {ACTIVE_CATEGORIES.map((cat) => {
            const isSelected = !onlyFavorites && selectedCategory === cat;
            const catName = locale === 'en'
              ? (CATEGORY_METADATA[cat]?.displayNameEn || cat)
              : (CATEGORY_METADATA[cat]?.displayNamePt || cat);

            return (
              <Pressable
                key={cat}
                onPress={() => {
                  setSelectedCategory(cat);
                  setOnlyFavorites(false);
                }}
                style={[
                  styles.chip,
                  {
                    borderRadius: radius.full,
                    backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.label,
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {catName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid de Exercícios */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.gridColumn}>
            <ExerciseCard
              exercise={item}
              index={index}
              onPress={() => handleSelectExercise(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="timer-outline"
            title={t.noExercisesFound}
            subtitle={t.noExercisesFoundSubtitle}
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
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  gridColumn: {
    width: '50%',
    paddingHorizontal: 2,
  },
});
