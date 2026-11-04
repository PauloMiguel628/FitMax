import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
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
import { useStopwatch } from '@/hooks/useStopwatch';
import { useCountdown } from '@/hooks/useCountdown';
import { useFavoritesStore } from '@/store/favoritesStore';
import { TimerRing } from '@/components/timer/TimerRing';
import { formatStopwatchTime } from '@/utils/time';
import { triggerTimerStartSignal } from '@/utils/sound';
import { Button } from '@/components/ui/Button';
import { localizeExercise } from '@/utils/exerciseLocalization';
import { useTranslation } from '@/i18n';

const COUNTDOWN_PRESETS = [30, 45, 60, 90, 120];

export default function ExerciseTimerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');

  const stopwatch = useStopwatch();
  const countdown = useCountdown({ initialDurationSeconds: 45, autoSignalOnStart: true });

  const isFavorite = useFavoritesStore((state) =>
    exercise ? !!state.favoriteIds[String(exercise.id)] : false
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const heartScale = useSharedValue(1);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      ExerciseService.getExerciseById(String(id)).then((data) => {
        if (isMounted) setExercise(data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const heartAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const activeMs = timerMode === 'countdown' ? countdown.remainingMs : stopwatch.elapsedMs;
  const activeRunning = timerMode === 'countdown' ? countdown.isRunning : stopwatch.isRunning;
  const { formatted } = formatStopwatchTime(activeMs);
  const localized = exercise ? localizeExercise(exercise, locale) : null;

  const handleSwitchMode = (nextMode: 'stopwatch' | 'countdown') => {
    if (nextMode === timerMode) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    stopwatch.pause();
    countdown.pause();
    setTimerMode(nextMode);
  };

  const handlePrimaryStartOrResume = () => {
    if (timerMode === 'countdown') {
      if (
        countdown.isCompleted ||
        countdown.remainingMs <= 0 ||
        countdown.remainingMs === countdown.totalDurationMs
      ) {
        countdown.start();
      } else {
        countdown.resume();
      }
    } else {
      if (stopwatch.elapsedMs > 0) {
        stopwatch.resume();
      } else {
        triggerTimerStartSignal();
        stopwatch.start();
      }
    }
  };

  const handlePause = () => {
    if (timerMode === 'countdown') {
      countdown.pause();
    } else {
      stopwatch.pause();
    }
  };

  const handleReset = () => {
    if (timerMode === 'countdown') {
      countdown.reset();
    } else {
      stopwatch.reset();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 14) }]}>
      {/* Top Bar com voltar, título e ações */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.circleButton, { backgroundColor: colors.surfaceElevated }]}
          accessibilityRole="button"
          accessibilityLabel={t.back}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <Text
          style={[typography.title3, styles.topBarTitle, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {localized ? localized.name : t.timerTitle}
        </Text>

        <View style={styles.topRightActions}>
          {/* Botão de instruções (abre sheet sem sair da tela) */}
          <Pressable
            onPress={() => setInstructionsVisible(true)}
            style={[styles.circleButton, { backgroundColor: colors.surfaceElevated }]}
            accessibilityRole="button"
            accessibilityLabel={t.timerViewInstructions}
          >
            <Ionicons name="information-circle-outline" size={22} color={colors.text} />
          </Pressable>

          {/* Botão de favoritar */}
          <Pressable
            onPress={handleToggleFavorite}
            style={[styles.circleButton, { backgroundColor: colors.surfaceElevated }]}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? t.favoritesRemove : t.favoritesTitle}
          >
            <Animated.View style={heartAnimStyle}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.primary : colors.textSecondary}
              />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animação do exercício em destaque */}
        {exercise && (
          <View
            style={[
              styles.animationContainer,
              {
                borderRadius: radius.xxl,
                backgroundColor: '#FFFFFF', // Card branco limpo para a figura anatômica
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={{ uri: exercise.gifUrl }}
              style={styles.gifImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        )}

        {/* Seletor de Modo: Cronômetro Livre vs Contagem Regressiva */}
        <View
          style={[
            styles.modeSwitchContainer,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderRadius: radius.full,
            },
          ]}
        >
          <Pressable
            onPress={() => handleSwitchMode('stopwatch')}
            style={[
              styles.modeSwitchBtn,
              {
                backgroundColor: timerMode === 'stopwatch' ? colors.primary : 'transparent',
                borderRadius: radius.full,
              },
            ]}
          >
            <Ionicons
              name="stopwatch-outline"
              size={14}
              color={timerMode === 'stopwatch' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[
                typography.label,
                {
                  color: timerMode === 'stopwatch' ? '#FFFFFF' : colors.textSecondary,
                  fontSize: 10,
                  letterSpacing: 0,
                  marginLeft: 4,
                  textAlign: 'center',
                  flexShrink: 1,
                },
              ]}
            >
              {t.timerModeStopwatch}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleSwitchMode('countdown')}
            style={[
              styles.modeSwitchBtn,
              {
                backgroundColor: timerMode === 'countdown' ? colors.primary : 'transparent',
                borderRadius: radius.full,
              },
            ]}
          >
            <Ionicons
              name="hourglass-outline"
              size={14}
              color={timerMode === 'countdown' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[
                typography.label,
                {
                  color: timerMode === 'countdown' ? '#FFFFFF' : colors.textSecondary,
                  fontSize: 10,
                  letterSpacing: 0,
                  marginLeft: 4,
                  textAlign: 'center',
                  flexShrink: 1,
                },
              ]}
            >
              {t.timerModeCountdown}
            </Text>
          </Pressable>
        </View>

        {/* Seletor de Tempo-Alvo (ex.: Prancha 45 s) quando em Contagem Regressiva */}
        {timerMode === 'countdown' && (
          <View style={styles.countdownConfigWrap}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: 6 }]}>
              {t.countdownTargetLabel}: <Text style={{ color: colors.primary, fontWeight: '800' }}>{countdown.targetSeconds} s</Text>
            </Text>
            <View style={styles.presetPillsRow}>
              {COUNTDOWN_PRESETS.map((sec) => {
                const isSelected = countdown.targetSeconds === sec;
                return (
                  <Pressable
                    key={sec}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      countdown.setTargetDuration(sec);
                    }}
                    style={[
                      styles.presetPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.label,
                        { color: isSelected ? '#FFFFFF' : colors.text, fontSize: 11 },
                      ]}
                    >
                      {sec}s
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => countdown.addSeconds(15)}
                style={[
                  styles.presetPill,
                  {
                    backgroundColor: colors.primaryMuted,
                    borderColor: colors.primary,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text style={[typography.label, { color: colors.primary, fontSize: 11 }]}>
                  {t.restAdd15sBtn}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Anel de Progresso SVG com números grandes display */}
        <TimerRing
          elapsedMs={activeMs}
          isRunning={activeRunning}
          progress={timerMode === 'countdown' ? countdown.progress : undefined}
          size={240}
          strokeWidth={12}
        >
          <Text
            style={[
              typography.timerLarge,
              styles.timerText,
              {
                color:
                  timerMode === 'countdown' && countdown.isCompleted
                    ? colors.success
                    : activeRunning
                    ? colors.primary
                    : colors.text,
              },
            ]}
          >
            {formatted}
          </Text>
          <Text
            style={[
              typography.bodySmall,
              {
                color:
                  timerMode === 'countdown' && countdown.isCompleted
                    ? colors.success
                    : colors.textSecondary,
                marginTop: -4,
                textAlign: 'center',
                paddingHorizontal: 14,
              },
            ]}
          >
            {timerMode === 'countdown' && countdown.isCompleted
              ? t.countdownFinishedText
              : activeRunning
              ? t.timerKeepAwakeNote
              : timerMode === 'countdown'
              ? t.countdownSignalNote
              : 'MM:SS'}
          </Text>
        </TimerRing>

        {/* Controles do Cronômetro: Iniciar, Pausar, Retomar e Zerar */}
        <View style={[styles.controlsRow, { gap: spacing.md }]}>
          <Pressable
            onPress={handleReset}
            style={[
              styles.secondaryControlButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.full,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.timerReset}
          >
            <Ionicons name="refresh" size={22} color={colors.textSecondary} />
            <Text style={[typography.label, { color: colors.textSecondary, marginLeft: 6 }]}>
              {t.timerReset}
            </Text>
          </Pressable>

          {activeRunning ? (
            <Button
              title={t.timerPause}
              variant="primary"
              size="lg"
              onPress={handlePause}
              icon={<Ionicons name="pause" size={22} color="#FFFFFF" />}
              style={styles.mainActionButton}
            />
          ) : (
            <Button
              title={
                timerMode === 'countdown'
                  ? countdown.remainingMs < countdown.totalDurationMs && countdown.remainingMs > 0
                    ? t.timerResume
                    : t.timerStart
                  : stopwatch.elapsedMs > 0
                  ? t.timerResume
                  : t.timerStart
              }
              variant="primary"
              size="lg"
              onPress={handlePrimaryStartOrResume}
              icon={<Ionicons name="play" size={22} color="#FFFFFF" />}
              style={styles.mainActionButton}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal/Sheet de Instruções sem sair da tela */}
      <Modal
        visible={instructionsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInstructionsVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setInstructionsVisible(false)}
          />
          <View
            style={[
              styles.sheetContent,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xxl,
                borderTopRightRadius: radius.xxl,
                padding: spacing.xl,
                maxHeight: '70%',
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[typography.title2, { color: colors.text }]}>
                {t.instructions}
              </Text>
              <Pressable
                onPress={() => setInstructionsVisible(false)}
                style={[styles.circleButton, { backgroundColor: colors.surfaceElevated }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={true}>
              {localized?.instructions && localized.instructions.length > 0 ? (
                localized.instructions.map((step, idx) => (
                  <View key={idx} style={styles.instructionStep}>
                    <View
                      style={[
                        styles.stepBadge,
                        { backgroundColor: colors.primaryMuted },
                      ]}
                    >
                      <Text style={[typography.label, { color: colors.primary, fontSize: 12 }]}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        typography.bodyMedium,
                        { color: colors.text, flex: 1, lineHeight: 22 },
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                  {localized?.name}
                </Text>
              )}
            </ScrollView>

            <Button
              title={t.close}
              variant="secondary"
              onPress={() => setInstructionsVisible(false)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  animationContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
    width: '100%',
    marginVertical: 6,
    alignItems: 'center',
  },
  modeSwitchBtn: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countdownConfigWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  presetPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  timerText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
    justifyContent: 'center',
  },
  secondaryControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
  },
  mainActionButton: {
    flex: 1,
    maxWidth: 200,
    height: 54,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContent: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
});
