import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Exercise } from '@/types';
import { ExerciseService } from '@/services/exerciseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { localizeExercise } from '@/utils/exerciseLocalization';
import { useTranslation } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_CARD_HEIGHT = 320;

export default function ExerciseDetailModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography, isDark } = useAppTheme();
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFavorite = useFavoritesStore((state) =>
    exercise ? !!state.favoriteIds[String(exercise.id)] : false
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const heartScale = useSharedValue(1);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      ExerciseService.getExerciseById(String(id))
        .then((data) => {
          if (isMounted) {
            setExercise(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.back();
  };

  const handleToggleFavorite = () => {
    if (!exercise) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    heartScale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    toggleFavorite(exercise);
  };

  const handleStartTimer = () => {
    if (!exercise) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: '/exercise-timer/[id]',
      params: { id: exercise.id },
    });
  };

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <Text style={[typography.title3, { color: colors.text }]}>
          {t.noExercisesFound}
        </Text>
        <Button title={t.close} onPress={handleClose} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const localizedExercise = localizeExercise(exercise, locale);

  const secondaryMusclesText = localizedExercise.secondaryMuscles && localizedExercise.secondaryMuscles.length > 0
    ? localizedExercise.secondaryMuscles.join(', ')
    : 'Core';

  return (
    <View style={styles.modalBackdrop}>
      {/* Conteúdo principal do Modal */}
      <View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: radius.huge,
            borderTopRightRadius: radius.huge,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <ScrollView
          style={[styles.scrollView, { backgroundColor: colors.surface }]}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.surface }]}
          showsVerticalScrollIndicator={true}
        >
          {/* Cartão grande no topo com a ANIMAÇÃO em loop e cantos inferiores arredondados */}
          <View
            style={[
              styles.topCard,
              {
                borderBottomLeftRadius: radius.huge,
                borderBottomRightRadius: radius.huge,
                backgroundColor: '#FFFFFF',
              },
            ]}
          >
            {/* Botão circular vermelho de fechar (X) no canto superior direito */}
            <Pressable
              onPress={handleClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.primary },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t.close}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Botão de favoritar no canto superior esquerdo */}
            <Pressable
              onPress={handleToggleFavorite}
              style={styles.favoriteButton}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? t.favoritesRemove : t.favoritesTitle}
            >
              <Animated.View style={heartAnimStyle}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? colors.primary : '#64748B'}
                />
              </Animated.View>
            </Pressable>

            {/* Imagem / GIF da animação */}
            {!imageLoaded && (
              <Skeleton width="100%" height={TOP_CARD_HEIGHT} borderRadius={radius.huge} />
            )}
            <Image
              source={{ uri: exercise.gifUrl }}
              style={[
                styles.gifImage,
                { opacity: imageLoaded ? 1 : 0 },
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
              onLoad={() => setImageLoaded(true)}
            />
          </View>

          {/* Área de informações do exercício */}
          <View
            style={[
              styles.infoBody,
              {
                padding: spacing.xl,
                backgroundColor: colors.surface,
              },
            ]}
          >
            {/* Título do exercício localizado */}
            <Text
              style={[
                typography.title1,
                styles.exerciseTitle,
                { color: colors.text },
              ]}
            >
              {localizedExercise.name}
            </Text>

            {/* 3 Linhas com o valor em negrito: Equipment, Secondary Muscles e Target */}
            <View style={[styles.metaLinesContainer, { borderBottomColor: colors.border }]}>
              <View style={styles.metaRow}>
                <Text style={[typography.bodyMedium, styles.metaLabel, { color: colors.textSecondary }]}>
                  {t.equipment}:
                </Text>
                <Text style={[typography.bodyLarge, styles.metaValue, { color: colors.text }]}>
                  {localizedExercise.equipment || t.bodyWeightOnly}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[typography.bodyMedium, styles.metaLabel, { color: colors.textSecondary }]}>
                  {t.secondaryMuscles}:
                </Text>
                <Text style={[typography.bodyLarge, styles.metaValue, { color: colors.text }]}>
                  {secondaryMusclesText}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[typography.bodyMedium, styles.metaLabel, { color: colors.textSecondary }]}>
                  {t.target}:
                </Text>
                <Text style={[typography.bodyLarge, styles.metaValue, { color: colors.text }]}>
                  {localizedExercise.target}
                </Text>
              </View>
            </View>

            {/* Seção "Instructions" com os passos em texto rolável em Português */}
            <View style={styles.instructionsSection}>
              <Text
                style={[
                  typography.title2,
                  styles.instructionsHeading,
                  { color: colors.text, marginBottom: spacing.md },
                ]}
              >
                {t.instructions}
              </Text>

              {localizedExercise.instructions && localizedExercise.instructions.length > 0 ? (
                localizedExercise.instructions.map((step, idx) => (
                  <View key={idx} style={styles.instructionStepRow}>
                    <View
                      style={[
                        styles.stepNumberBadge,
                        { backgroundColor: colors.primaryMuted },
                      ]}
                    >
                      <Text
                        style={[
                          typography.label,
                          { color: colors.primary, fontSize: 12 },
                        ]}
                      >
                        {idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        typography.bodyLarge,
                        styles.instructionText,
                        { color: isDark ? '#D1D5DB' : '#334155' },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                  {localizedExercise.name}
                </Text>
              )}
            </View>

            {/* Botão de ação: "Iniciar com cronômetro" */}
            <View style={styles.actionsFooter}>
              <Button
                title={t.startWithTimer}
                onPress={handleStartTimer}
                size="lg"
                icon={<Ionicons name="timer-outline" size={22} color="#FFFFFF" />}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '92%',
    height: '92%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  topCard: {
    width: SCREEN_WIDTH,
    height: TOP_CARD_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  infoBody: {
    flex: 1,
  },
  exerciseTitle: {
    fontWeight: '900',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 18,
    textTransform: 'capitalize',
  },
  metaLinesContainer: {
    marginBottom: 24,
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  metaLabel: {
    marginRight: 6,
    fontWeight: '500',
  },
  metaValue: {
    fontWeight: '800',
  },
  instructionsSection: {
    marginBottom: 28,
  },
  instructionsHeading: {
    fontWeight: '800',
  },
  instructionStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    lineHeight: 22,
  },
  actionsFooter: {
    marginTop: 'auto',
    paddingTop: 12,
  },
});
