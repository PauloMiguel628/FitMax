import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Exercise } from '@/types';
import { ExerciseService } from '@/services/exerciseService';
import { CATEGORY_METADATA } from '@/config/home-friendly';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/i18n';
import { getLocalizedExerciseName, getLocalizedTarget } from '@/utils/exerciseLocalization';

const HEADER_IMAGE_HEIGHT = 240;

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();
  const { bodyPart } = useLocalSearchParams<{ bodyPart: string }>();

  const currentCategory = (bodyPart || 'chest').toLowerCase();
  const categoryMeta = CATEGORY_METADATA[currentCategory] || {
    displayNamePt: currentCategory,
    displayNameEn: currentCategory,
    coverUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    descriptionPt: '',
    descriptionEn: '',
  };

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    ExerciseService.getExercisesByBodyPart(currentCategory)
      .then((data) => {
        if (isMounted) {
          setExercises(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentCategory]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    const q = searchQuery.toLowerCase().trim();
    return exercises.filter((ex) => {
      const ptName = getLocalizedExerciseName(ex.name, locale).toLowerCase();
      const ptTarget = getLocalizedTarget(ex.target, locale).toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.target.toLowerCase().includes(q) ||
        ptName.includes(q) ||
        ptTarget.includes(q)
      );
    });
  }, [exercises, searchQuery, locale]);

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

  const handleExercisePress = (exercise: Exercise) => {
    router.push({
      pathname: '/exercise/[id]',
      params: { id: exercise.id },
    });
  };

  const titleText = locale === 'pt-BR' 
    ? `Exercícios de ${categoryMeta.displayNamePt}`
    : `${categoryMeta.displayNameEn} ${t.exercises}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.FlatList
        data={filteredExercises}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 40, 60) }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            {/* Foto grande da categoria com cantos inferiores arredondados */}
            <View
              style={[
                styles.headerImageContainer,
                {
                  width: screenWidth,
                  borderBottomLeftRadius: radius.huge,
                  borderBottomRightRadius: radius.huge,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <Image
                source={{ uri: categoryMeta.coverUrl }}
                style={styles.headerImage}
                contentFit="cover"
                priority="high"
              />

              {/* Botão circular vermelho de voltar (seta branca) sobre a imagem */}
              <Pressable
                onPress={handleBack}
                style={[
                  styles.backButton,
                  {
                    top: Math.max(insets.top + 10, 20),
                    backgroundColor: colors.primary,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t.back}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Título da categoria, ex.: "back exercises" */}
            <View style={[styles.titleSection, { paddingHorizontal: spacing.lg }]}>
              <Text
                style={[
                  typography.title1,
                  styles.categoryTitle,
                  { color: colors.text },
                ]}
              >
                {titleText}
              </Text>

              {/* Barra de busca de exercícios */}
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t.searchExercisePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.searchInput,
                    typography.bodyMedium,
                    { color: colors.text },
                  ]}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        }
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
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 12 }]}>
                {t.loadingExercises}
              </Text>
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title={t.noExercisesFound}
              subtitle={t.noExercisesFoundSubtitle}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  headerWrapper: {
    marginBottom: 12,
  },
  headerImageContainer: {
    height: HEADER_IMAGE_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
  },
  titleSection: {
    marginTop: 18,
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  searchContainer: {
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
  gridColumn: {
    width: '50%',
    paddingHorizontal: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
