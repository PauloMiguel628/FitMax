import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Workout } from '@/types';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSessionStore } from '@/store/sessionStore';
import { useHistoryStore } from '@/store/historyStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getLocalizedExerciseName, getLocalizedWorkoutName } from '@/utils/exerciseLocalization';
import { formatFriendlyDuration } from '@/utils/time';
import { useTranslation } from '@/i18n';

export default function WorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const workouts = useWorkoutStore((state) => state.workouts);
  const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout);
  const duplicateWorkout = useWorkoutStore((state) => state.duplicateWorkout);
  const startSession = useSessionStore((state) => state.startSession);
  const history = useHistoryStore((state) => state.history);
  const totalHistoryTimeMs = history.reduce((acc, h) => acc + (h.durationMs || 0), 0);

  const handleOpenHistory = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/history');
  };

  const handleStartWorkout = (workout: Workout) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    startSession(workout);
    router.push({
      pathname: '/workout/[id]/session',
      params: { id: workout.id },
    });
  };

  const handleDeleteWorkout = (workout: Workout) => {
    Alert.alert(
      t.deleteWorkout,
      `${t.deleteWorkoutConfirm} "${workout.name}"`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.deleteWorkout,
          style: 'destructive',
          onPress: () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            deleteWorkout(workout.id);
          },
        },
      ]
    );
  };

  const handleDuplicate = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    duplicateWorkout(id);
  };

  const handleCreateNew = () => {
    router.push('/workout/new');
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: '/workout/[id]/edit',
      params: { id },
    });
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header com título completo visível e botão de ação alinhado */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }]}>
        <View style={styles.headerTitleWrap}>
          <Text
            style={[typography.title1, styles.headerTitleText, { color: colors.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {t.workoutsTitle}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            {workouts.length} {t.routinesConfigured}
          </Text>
        </View>

        <Button
          title={t.addNewWorkoutBtn}
          size="sm"
          onPress={handleCreateNew}
          style={styles.headerAddBtn}
        />
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Pressable
            onPress={handleOpenHistory}
            style={({ pressed }) => [
              styles.historyShortcutCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderRadius: radius.xxl,
                padding: spacing.md,
                marginBottom: spacing.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.workoutHistoryShortcutTitle}
          >
            <View
              style={[
                styles.historyShortcutIconWrap,
                { backgroundColor: colors.primaryMuted, borderRadius: radius.xl },
              ]}
            >
              <Ionicons name="trophy" size={24} color={colors.primary} />
            </View>
            <View style={styles.historyShortcutTextWrap}>
              <Text style={[typography.title3, { color: colors.text, fontSize: 16 }]}>
                {t.workoutHistoryShortcutTitle}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                {history.length > 0
                  ? `${history.length} ${t.completedWorkouts.toLowerCase()} • ${formatFriendlyDuration(totalHistoryTimeMs, locale)}`
                  : t.workoutHistoryShortcutSubtitle}
              </Text>
            </View>
            <View
              style={[
                styles.historyShortcutArrow,
                { backgroundColor: colors.surfaceElevated, borderRadius: radius.full },
              ]}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </View>
          </Pressable>
        }
        renderItem={({ item }) => {
          const totalSets = item.items.reduce((acc, curr) => acc + (curr.plannedSets || 3), 0);

          return (
            <View
              style={[
                styles.workoutCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xxl,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              {/* Topo do Card */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleInfo}>
                  <Text
                    style={[typography.title3, styles.workoutName, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {getLocalizedWorkoutName(item.name, locale)}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {item.items.length} {t.exercises} • {totalSets} {t.setsCount}
                  </Text>
                </View>

                {/* Ações do Card: Duplicar, Editar e Excluir */}
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => handleDuplicate(item.id)}
                    style={styles.actionIconBtn}
                    accessibilityLabel={t.duplicateWorkout}
                  >
                    <Ionicons name="copy-outline" size={19} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleEdit(item.id)}
                    style={styles.actionIconBtn}
                    accessibilityLabel={t.editWorkout}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteWorkout(item)}
                    style={styles.actionIconBtn}
                    accessibilityLabel={t.deleteWorkout}
                  >
                    <Ionicons name="trash-outline" size={19} color={colors.error} />
                  </Pressable>
                </View>
              </View>

              {/* Preview dos exercícios do treino traduzidos */}
              <View style={styles.exercisePreviewList}>
                {item.items.slice(0, 3).map((wItem, idx) => {
                  const localizedName = getLocalizedExerciseName(wItem.exercise.name, locale);
                  return (
                    <View key={idx} style={styles.exercisePreviewItem}>
                      <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                      <Text
                        style={[
                          typography.bodySmall,
                          { color: colors.text, marginLeft: 6, flex: 1 },
                        ]}
                        numberOfLines={1}
                      >
                        {localizedName} ({wItem.plannedSets} {t.setsCount})
                      </Text>
                    </View>
                  );
                })}
                {item.items.length > 3 && (
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {t.moreExercises.replace('{count}', String(item.items.length - 3))}
                  </Text>
                )}
              </View>

              {/* Botão de Disparar Sessão de Treino */}
              <Button
                title={t.startWorkout}
                size="md"
                onPress={() => handleStartWorkout(item)}
                icon={<Ionicons name="play" size={18} color="#FFFFFF" />}
                style={{ marginTop: spacing.md }}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="barbell-outline"
            title={t.workoutsEmpty}
            subtitle={t.workoutsEmptySubtitle}
            actionTitle="+ Novo Treino"
            onAction={handleCreateNew}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  headerTitleText: {
    fontWeight: '800',
    fontSize: 25,
    lineHeight: 30,
  },
  headerAddBtn: {
    paddingHorizontal: 14,
    height: 40,
    flexShrink: 0,
  },
  historyShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  historyShortcutIconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyShortcutTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  historyShortcutArrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
  },
  workoutCard: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    marginRight: 8,
  },
  workoutName: {
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  actionIconBtn: {
    padding: 6,
  },
  exercisePreviewList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
