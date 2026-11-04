import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Exercise } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { getLocalizedExerciseName } from '@/utils/exerciseLocalization';
import { useTranslation } from '@/i18n';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onSelectExercise?: (exercise: Exercise) => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const loadedGifUrls = new Set<string>();

function ExerciseCardComponent({
  exercise,
  onPress,
  onSelectExercise,
}: ExerciseCardProps) {
  const { colors, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(() =>
    loadedGifUrls.has(exercise.gifUrl)
  );
  const [hasError, setHasError] = useState(false);

  const displayName = getLocalizedExerciseName(exercise.name, locale);

  const isFavorite = useFavoritesStore((state) => !!state.favoriteIds[String(exercise.id)]);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleToggleFavorite = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    heartScale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    toggleFavorite(exercise);
  };

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        if (onSelectExercise) {
          onSelectExercise(exercise);
        } else if (onPress) {
          onPress();
        }
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          borderRadius: radius.xl,
          backgroundColor: '#FFFFFF', // Card branco conforme especificação e prints
          borderColor: colors.border,
        },
        cardAnimStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${t.exerciseSingle} ${displayName}`}
    >
      {/* Botão de Favorito no topo direito do card */}
      <Pressable
        onPress={handleToggleFavorite}
        style={styles.favoriteButton}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? t.favoritesRemove : t.favoritesTitle}
      >
        <Animated.View style={heartAnimStyle}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? colors.primary : '#94A3B8'}
          />
        </Animated.View>
      </Pressable>

      {/* Área da Animação */}
      <View style={[styles.imageContainer, { borderRadius: radius.lg }]}>
        {!imageLoaded && !hasError && (
          <Skeleton width="100%" height={130} borderRadius={radius.lg} />
        )}
        <Image
          source={{ uri: exercise.gifUrl }}
          recyclingKey={String(exercise.id)}
          style={[
            styles.gifImage,
            { opacity: imageLoaded ? 1 : 0 },
          ]}
          contentFit="contain"
          cachePolicy="memory-disk"
          onLoad={() => {
            loadedGifUrls.add(exercise.gifUrl);
            setImageLoaded((prev) => (prev ? prev : true));
          }}
          onError={() => {
            setHasError(true);
            setImageLoaded(true);
          }}
        />
        {hasError && (
          <View style={styles.errorContainer}>
            <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Nome do exercício localizado */}
      <View style={styles.infoContainer}>
        <Text
          style={[
            typography.bodyMedium,
            styles.nameText,
            { color: '#0F172A' },
          ]}
          numberOfLines={2}
        >
          {displayName}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

export const ExerciseCard = React.memo(ExerciseCardComponent);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    padding: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#F1F5F9', // Cinza claro de placeholder
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginTop: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  nameText: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
});
