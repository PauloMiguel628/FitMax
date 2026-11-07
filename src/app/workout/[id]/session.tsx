import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, usePreventRemove } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSessionStore } from '@/store/sessionStore';
import { useHistoryStore } from '@/store/historyStore';
import { showAppDialog } from '@/store/dialogStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useCountdown } from '@/hooks/useCountdown';
import { TimerRing } from '@/components/timer/TimerRing';
import { formatStopwatchTime } from '@/utils/time';
import { triggerTimerStartSignal, triggerTimerFinishSignal } from '@/utils/sound';
import { Button } from '@/components/ui/Button';
import { localizeExercise, getLocalizedExerciseName } from '@/utils/exerciseLocalization';
import { useTranslation } from '@/i18n';

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const currentSession = useSessionStore((state) => state.currentSession);
  const setCurrentIndex = useSessionStore((state) => state.setCurrentIndex);
  const toggleSetDone = useSessionStore((state) => state.toggleSetDone);
  const addExtraSet = useSessionStore((state) => state.addExtraSet);
  const removeSet = useSessionStore((state) => state.removeSet);
  const updateExerciseRestSeconds = useSessionStore((state) => state.updateExerciseRestSeconds);
  const startRestTimer = useSessionStore((state) => state.startRestTimer);
  const addRestTime = useSessionStore((state) => state.addRestTime);
  const clearRestTimer = useSessionStore((state) => state.clearRestTimer);
  const discardSession = useSessionStore((state) => state.discardSession);
  const completeSession = useSessionStore((state) => state.completeSession);
  const addHistoryEntry = useHistoryStore((state) => state.addHistoryEntry);

  // Modo do timer do exercício atual: cronômetro livre vs contagem regressiva
  const [exTimerMode, setExTimerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');

  // Cronômetro livre do exercício atual
  const {
    isRunning: isExRunning,
    elapsedMs: exElapsedMs,
    start: startExTimer,
    pause: pauseExTimer,
    resume: resumeExTimer,
    reset: resetExTimer,
  } = useStopwatch();

  // Contagem regressiva por exercício (ex.: prancha 45 s)
  const exCountdown = useCountdown({ initialDurationSeconds: 45, autoSignalOnStart: true });

  // Tempo total da sessão decorrido em tempo real e timer de descanso (cálculo por horário)
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);
  const [restRemainingMs, setRestRemainingMs] = useState(0);
  const [restFinishedNotice, setRestFinishedNotice] = useState(false);
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [allowExit, setAllowExit] = useState(false);

  const disablePrevention = usePreventRemove(
    Boolean(currentSession) && !allowExit,
    ({ repeat }) => {
      showAppDialog(
        t.sessionDiscard,
        t.sessionDiscardConfirm,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.sessionDiscard,
            style: 'destructive',
            onPress: () => {
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              } catch {}
              setAllowExit(true);
              discardSession();
              repeat();
            },
          },
        ]
      );
    }
  );

  const syncClocks = useCallback(() => {
    const sess = useSessionStore.getState().currentSession;
    if (!sess) return;
    const now = Date.now();
    setSessionElapsedMs(Math.max(0, now - sess.startedAt));

    if (sess.restEndsAt) {
      const rem = Math.max(0, sess.restEndsAt - now);
      setRestRemainingMs(rem);
      if (rem <= 0) {
        clearRestTimer();
        setRestFinishedNotice(true);
        triggerTimerFinishSignal();
      }
    } else {
      setRestRemainingMs(0);
    }
  }, [clearRestTimer]);

  useEffect(() => {
    if (!currentSession) return;
    const interval = setInterval(syncClocks, 150);
    return () => clearInterval(interval);
  }, [currentSession, syncClocks]);

  // Atualiza imediatamente ao destravar a tela ou voltar do segundo plano
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        syncClocks();
      }
    });
    return () => sub.remove();
  }, [syncClocks]);

  // Oculta automaticamente o pop-up de descanso finalizado após 5 segundos
  useEffect(() => {
    if (!restFinishedNotice) return;
    const timer = setTimeout(() => {
      setRestFinishedNotice(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [restFinishedNotice]);

  if (!currentSession) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.emptyContainer}>
          <Text style={[typography.title2, { color: colors.text }]}>
            {t.noActiveSession}
          </Text>
          <Button
            title={t.back}
            onPress={() => router.replace('/(tabs)/workouts')}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  const currentIndex = currentSession.currentIndex;
  const currentItem = currentSession.items[currentIndex];
  const currentExercise = currentSession.snapshots[currentItem.exerciseId];
  const totalExercises = currentSession.items.length;

  const totalSessionTime = formatStopwatchTime(sessionElapsedMs).formatted;
  const activeExMs = exTimerMode === 'countdown' ? exCountdown.remainingMs : exElapsedMs;
  const activeExRunning = exTimerMode === 'countdown' ? exCountdown.isRunning : isExRunning;
  const exerciseTime = formatStopwatchTime(activeExMs).formatted;
  const localizedExercise = currentExercise ? localizeExercise(currentExercise, locale) : null;
  const configuredRestSec = currentItem.restSeconds || currentSession.defaultRestSeconds || 60;
  const restTotalMs = currentSession.restTotalMs || configuredRestSec * 1000;
  const restProgress = restTotalMs > 0 ? Math.max(0, Math.min(1, restRemainingMs / restTotalMs)) : 0;

  const handleNextExercise = () => {
    if (currentIndex < totalExercises - 1) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      resetExTimer();
      exCountdown.reset();
      setRestFinishedNotice(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentIndex > 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      resetExTimer();
      exCountdown.reset();
      setRestFinishedNotice(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleSet = (setIdx: number) => {
    const isMarkingDone = setIdx >= currentItem.doneSets;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    toggleSetDone(currentItem.exerciseId, setIdx);

    // Ao marcar uma série como feita, inicia automaticamente o timer de descanso configurável
    if (isMarkingDone) {
      setRestFinishedNotice(false);
      setRestRemainingMs(configuredRestSec * 1000);
      startRestTimer(configuredRestSec);
    }
  };

  const handleAdjustExerciseRest = (deltaSec: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    updateExerciseRestSeconds(currentItem.exerciseId, configuredRestSec + deltaSec);
  };

  const handleSkipRest = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    clearRestTimer();
    setRestRemainingMs(0);
    setRestFinishedNotice(false);
  };

  const handleAddRest15s = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    addRestTime(15);
  };

  const handleAddSet = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    addExtraSet(currentItem.exerciseId);
  };

  const handleRemoveSet = () => {
    if (currentItem.plannedSets <= 1) {
      showAppDialog(t.error, t.sessionMinSetAlert);
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    removeSet(currentItem.exerciseId);
  };

  const handleFinishWorkout = () => {
    // Checa se há exercícios sem séries concluídas
    const hasIncomplete = currentSession.items.some(
      (item) => item.doneSets < item.plannedSets
    );

    if (hasIncomplete) {
      showAppDialog(
        t.sessionFinish,
        t.sessionFinishIncompleteConfirm,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.sessionFinish,
            style: 'default',
            onPress: () => finalize(),
          },
        ],
        { icon: 'flag-outline' }
      );
    } else {
      finalize();
    }
  };

  const finalize = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setAllowExit(true);
    disablePrevention();
    const entry = completeSession();
    if (entry) {
      addHistoryEntry(entry);
      router.replace({
        pathname: '/workout/summary',
        params: { historyId: entry.id },
      });
    }
  };

  const handleDiscard = () => {
    showAppDialog(
      t.sessionDiscard,
      t.sessionDiscardConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.sessionDiscard,
          style: 'destructive',
          onPress: () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            setAllowExit(true);
            disablePrevention();
            discardSession();
            router.replace('/(tabs)/workouts');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 14) }]}>
      {/* Top Bar: Duração Total da Sessão + Botão de Descartar */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
        <Pressable
          onPress={handleDiscard}
          style={[styles.topIconBtn, { backgroundColor: colors.surfaceElevated }]}
          accessibilityLabel={t.sessionDiscard}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.topTimeWrap}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            {t.sessionTotalTime}
          </Text>
          <Text style={[typography.title3, { color: colors.primary, fontWeight: '900' }]}>
            {totalSessionTime}
          </Text>
        </View>

        <Pressable
          onPress={() => setJumpModalVisible(true)}
          style={[styles.topIconBtn, { backgroundColor: colors.surfaceElevated }]}
          accessibilityLabel={t.sessionJumpTo}
        >
          <Ionicons name="list" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 28, 48) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Indicador de Progresso (ex.: "exercício 2 de 6") */}
        <View style={styles.progressRow}>
          <Text style={[typography.label, { color: colors.primary }]}>
            {t.sessionExerciseProgress
              .replace('{current}', String(currentIndex + 1))
              .replace('{total}', String(totalExercises))}
          </Text>
        </View>

        {/* Animação do Exercício Atual em Destaque */}
        {currentExercise && (
          <View
            style={[
              styles.exerciseCard,
              {
                borderRadius: radius.xxl,
                backgroundColor: '#FFFFFF', // Card branco limpo de alta fidelidade
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={{ uri: currentExercise.gifUrl }}
              style={styles.gifImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        )}

        {/* Nome do Exercício Localizado */}
        <Text style={[typography.title2, styles.exerciseTitle, { color: colors.text }]}>
          {localizedExercise ? localizedExercise.name : ''}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: 12 }]}>
          {localizedExercise?.target} • {localizedExercise?.equipment || t.bodyWeightOnly}
        </Text>

        {/* Cronômetro do Exercício (Livre ou Contagem Regressiva com Tempo-Alvo) */}
        <View
          style={[
            styles.timerBox,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.xl,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 14,
            },
          ]}
        >
          {/* Chave Seletora de Modo: Cronômetro Livre vs Contagem Regressiva */}
          <View
            style={[
              styles.exModeSwitchRow,
              { backgroundColor: colors.surface, borderRadius: radius.full, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={() => {
                pauseExTimer();
                exCountdown.pause();
                setExTimerMode('stopwatch');
              }}
              style={[
                styles.exModeBtn,
                {
                  backgroundColor: exTimerMode === 'stopwatch' ? colors.primary : 'transparent',
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  typography.label,
                  {
                    color: exTimerMode === 'stopwatch' ? '#FFFFFF' : colors.textSecondary,
                    fontSize: 10.5,
                    letterSpacing: 0.1,
                    textAlign: 'center',
                  },
                ]}
              >
                {t.timerModeStopwatch}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                pauseExTimer();
                exCountdown.pause();
                setExTimerMode('countdown');
              }}
              style={[
                styles.exModeBtn,
                {
                  backgroundColor: exTimerMode === 'countdown' ? colors.primary : 'transparent',
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  typography.label,
                  {
                    color: exTimerMode === 'countdown' ? '#FFFFFF' : colors.textSecondary,
                    fontSize: 10.5,
                    letterSpacing: 0.1,
                    textAlign: 'center',
                  },
                ]}
              >
                {t.timerModeCountdown}
              </Text>
            </Pressable>
          </View>

          {exTimerMode === 'countdown' && (
            <View style={styles.exCountdownPresetsRow}>
              {[30, 45, 60, 90].map((sec) => {
                const active = exCountdown.targetSeconds === sec;
                return (
                  <Pressable
                    key={sec}
                    onPress={() => exCountdown.setTargetDuration(sec)}
                    style={[
                      styles.exPresetChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.label,
                        { color: active ? '#FFFFFF' : colors.text, fontSize: 10 },
                      ]}
                    >
                      {sec}s
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
            {exTimerMode === 'countdown' && exCountdown.isCompleted
              ? t.countdownFinishedText
              : t.sessionCurrentTime}
          </Text>
          <Text
            style={[
              typography.timerLarge,
              {
                color:
                  exTimerMode === 'countdown' && exCountdown.isCompleted
                    ? colors.success
                    : activeExRunning
                    ? colors.primary
                    : colors.text,
                fontSize: 38,
                lineHeight: 44,
              },
            ]}
          >
            {exerciseTime}
          </Text>

          <View style={styles.timerControlsRow}>
            <Pressable
              onPress={exTimerMode === 'countdown' ? () => exCountdown.reset() : resetExTimer}
              style={[styles.timerControlBtn, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="refresh" size={18} color={colors.textSecondary} />
            </Pressable>
            {activeExRunning ? (
              <Pressable
                onPress={exTimerMode === 'countdown' ? exCountdown.pause : pauseExTimer}
                style={[styles.timerControlBtnPrimary, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="pause" size={20} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable
                onPress={
                  exTimerMode === 'countdown'
                    ? () => {
                        if (
                          exCountdown.isCompleted ||
                          exCountdown.remainingMs <= 0 ||
                          exCountdown.remainingMs === exCountdown.totalDurationMs
                        ) {
                          exCountdown.start();
                        } else {
                          exCountdown.resume();
                        }
                      }
                    : () => {
                        if (exElapsedMs > 0) {
                          resumeExTimer();
                        } else {
                          triggerTimerStartSignal();
                          startExTimer();
                        }
                      }
                }
                style={[styles.timerControlBtnPrimary, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Card de Descanso entre Séries com Anel Animado (inicia ao marcar uma série) */}
        {restRemainingMs > 0 && (
          <View
            style={[
              styles.restCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderRadius: radius.xxl,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={[typography.title3, { color: colors.text }]}>
              {t.restTimerTitle}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: 4 }]}>
              {t.restTimerSubtitle}
            </Text>

            <TimerRing
              elapsedMs={restRemainingMs}
              isRunning={true}
              progress={restProgress}
              size={168}
              strokeWidth={10}
            >
              <Text style={[typography.title1, { color: colors.primary, fontWeight: '900' }]}>
                {formatStopwatchTime(restRemainingMs).formatted}
              </Text>
            </TimerRing>

            <View style={styles.restActionsRow}>
              <Pressable
                onPress={handleAddRest15s}
                style={[
                  styles.restBtn,
                  {
                    backgroundColor: colors.primaryMuted,
                    borderColor: colors.primary,
                    borderRadius: radius.full,
                  },
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={[typography.label, { color: colors.primary, marginLeft: 4 }]}>
                  {t.restAdd15sBtn}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSkipRest}
                style={[
                  styles.restBtn,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    borderRadius: radius.full,
                  },
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="play-skip-forward" size={16} color={colors.text} />
                <Text style={[typography.label, { color: colors.text, marginLeft: 6 }]}>
                  {t.restSkipBtn}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {restFinishedNotice && restRemainingMs === 0 && (
          <View
            style={[
              styles.restFinishedBanner,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.success,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '700', marginLeft: 8, flex: 1 }]}>
              {t.restFinishedBadge}
            </Text>
            <Pressable
              onPress={() => setRestFinishedNotice(false)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t.close}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Contador de Séries com Marcadores Interativos */}
        <View style={styles.setsSection}>
          <Text
            numberOfLines={1}
            style={[
              typography.title3,
              {
                color: colors.text,
                marginBottom: 8,
              },
            ]}
          >
            {t.sessionSetsDone} ({currentItem.doneSets}/{currentItem.plannedSets})
          </Text>

          <View style={styles.setsActionsRow}>
            <Pressable
              onPress={handleRemoveSet}
              style={[
                styles.setActionBtn,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.full,
                  opacity: currentItem.plannedSets <= 1 ? 0.45 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t.sessionRemoveSet}
            >
              <Ionicons name="trash-outline" size={14} color={colors.error} />
              <Text style={[typography.label, { color: colors.error, fontSize: 11, marginLeft: 4 }]}>
                {t.sessionRemoveSet}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleAddSet}
              style={[
                styles.setActionBtn,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: colors.primary,
                  borderRadius: radius.full,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t.sessionAddSet}
            >
              <Text style={[typography.label, { color: colors.primary, fontSize: 11 }]}>
                {t.sessionAddSet}
              </Text>
            </Pressable>
          </View>

          {/* Linha de marcadores de séries */}
          <View style={styles.setsMarkersRow}>
            {Array.from({ length: currentItem.plannedSets }).map((_, sIdx) => {
              const isDone = sIdx < currentItem.doneSets;
              return (
                <Pressable
                  key={sIdx}
                  onPress={() => handleToggleSet(sIdx)}
                  style={[
                    styles.setMarker,
                    {
                      backgroundColor: isDone ? colors.primary : colors.surfaceElevated,
                      borderColor: isDone ? colors.primary : colors.border,
                      borderRadius: radius.lg,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${t.set} ${sIdx + 1}`}
                >
                  <Text
                    style={[
                      typography.label,
                      { color: isDone ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    #{sIdx + 1}
                  </Text>
                  <Ionicons
                    name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isDone ? '#FFFFFF' : colors.textMuted}
                    style={{ marginTop: 2 }}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Barra de configuração de descanso por exercício */}
          <View
            style={[
              styles.restConfigBar,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <View style={styles.restConfigLabelWrap}>
              <Ionicons name="timer-outline" size={16} color={colors.primary} />
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 6 }]}>
                {t.restConfigPerExercise}
              </Text>
            </View>

            <View style={styles.restConfigControls}>
              <Pressable
                onPress={() => handleAdjustExerciseRest(-15)}
                style={[styles.restStepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[typography.label, { color: colors.text, fontSize: 10 }]}>-15s</Text>
              </Pressable>

              <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '800', minWidth: 38, textAlign: 'center' }]}>
                {configuredRestSec}s
              </Text>

              <Pressable
                onPress={() => handleAdjustExerciseRest(15)}
                style={[styles.restStepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[typography.label, { color: colors.text, fontSize: 10 }]}>+15s</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setRestFinishedNotice(false);
                  setRestRemainingMs(configuredRestSec * 1000);
                  startRestTimer(configuredRestSec);
                }}
                style={[
                  styles.restManualStartBtn,
                  { backgroundColor: colors.primary, borderRadius: radius.full },
                ]}
              >
                <Ionicons name="play" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Navegação entre exercícios: Anterior e Próximo */}
        <View style={styles.navRow}>
          <Pressable
            disabled={currentIndex === 0}
            onPress={handlePrevExercise}
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.full,
                opacity: currentIndex === 0 ? 0.35 : 1,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
            <Text style={[typography.label, { color: colors.text, marginLeft: 4 }]}>
              {t.sessionPrevious}
            </Text>
          </Pressable>

          <Pressable
            disabled={currentIndex === totalExercises - 1}
            onPress={handleNextExercise}
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.full,
                opacity: currentIndex === totalExercises - 1 ? 0.35 : 1,
              },
            ]}
          >
            <Text style={[typography.label, { color: colors.text, marginRight: 4 }]}>
              {t.sessionNext}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Botão Finalizar Treino (Sempre Visível) */}
        <Button
          title={t.sessionFinish}
          size="lg"
          onPress={handleFinishWorkout}
          icon={<Ionicons name="flag" size={20} color="#FFFFFF" />}
          style={{ marginTop: 24 }}
        />
      </ScrollView>

      {/* Modal para pular direto para um exercício */}
      <Modal
        visible={jumpModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setJumpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setJumpModalVisible(false)} />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderTopWidth: 1.5,
                borderTopLeftRadius: radius.xxl,
                borderTopRightRadius: radius.xxl,
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.lg,
                paddingBottom: Math.max(insets.bottom + 16, 28),
                maxHeight: '85%',
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <Text style={[typography.title2, { color: colors.text }]}>
                {t.sessionJumpTo}
              </Text>
              <Pressable
                onPress={() => setJumpModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: colors.surfaceElevated, borderRadius: radius.full },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t.close}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ paddingBottom: 6 }}
            >
              {currentSession.items.map((item, idx) => {
                const ex = currentSession.snapshots[item.exerciseId];
                const isCur = idx === currentIndex;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      resetExTimer();
                      setRestFinishedNotice(false);
                      setCurrentIndex(idx);
                      setJumpModalVisible(false);
                    }}
                    style={[
                      styles.jumpItemRow,
                      {
                        backgroundColor: isCur ? colors.primaryMuted : colors.surfaceElevated,
                        borderColor: isCur ? colors.primary : colors.border,
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    <Text style={[typography.label, { color: isCur ? colors.primary : colors.textSecondary }]}>
                      #{idx + 1}
                    </Text>
                    <Text
                      style={[
                        typography.bodyLarge,
                        { color: colors.text, flex: 1, marginHorizontal: 10, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {ex ? getLocalizedExerciseName(ex.name, locale) : ''}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      {item.doneSets}/{item.plannedSets} {t.setsCount}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={[styles.modalFooter, { paddingTop: spacing.sm }]}>
              <Button
                title={t.close}
                variant="secondary"
                onPress={() => setJumpModalVisible(false)}
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  topIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTimeWrap: {
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  progressRow: {
    marginBottom: 8,
  },
  exerciseCard: {
    width: '100%',
    height: 230,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  exerciseTitle: {
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  timerBox: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 12,
  },
  exModeSwitchRow: {
    flexDirection: 'row',
    width: '100%',
    padding: 3,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
  },
  exModeBtn: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  exCountdownPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  exPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  restCard: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    marginVertical: 8,
  },
  restActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  restBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  restFinishedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderWidth: 1,
    marginVertical: 6,
  },
  restConfigBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  restConfigLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restConfigControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  restManualStartBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  timerControlsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  timerControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerControlBtnPrimary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setsSection: {
    width: '100%',
    marginVertical: 12,
  },
  setsActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  setActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  setsMarkersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setMarker: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 54,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    width: '100%',
  },
  jumpItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
});
