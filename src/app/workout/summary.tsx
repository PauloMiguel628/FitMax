import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryStore } from '@/store/historyStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatFriendlyDuration } from '@/utils/time';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';
import { getLocalizedExerciseName } from '@/utils/exerciseLocalization';

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { historyId } = useLocalSearchParams<{ historyId: string }>();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const history = useHistoryStore((state) => state.history);
  const entry = history.find((h) => h.id === historyId) || history[0];

  const totalExercises = entry?.items?.length || 0;
  const totalSetsDone = entry?.items?.reduce((acc, curr) => acc + curr.doneSets, 0) || 0;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 14) }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 30, 60) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Ícone de Sucesso / Troféu */}
        <View
          style={[
            styles.trophyCircle,
            {
              backgroundColor: colors.primaryMuted,
              borderColor: colors.primary,
              borderRadius: radius.full,
            },
          ]}
        >
          <Ionicons name="trophy" size={54} color={colors.primary} />
        </View>

        <Text style={[typography.hero, styles.title, { color: colors.text }]}>
          {t.summaryTitle}
        </Text>
        <Text
          style={[
            typography.bodyMedium,
            styles.subtitle,
            { color: colors.textSecondary, marginBottom: spacing.xl },
          ]}
        >
          {t.summarySubtitle}
        </Text>

        {/* Métricas Principais */}
        <View style={styles.metricsGrid}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Ionicons name="time" size={24} color="#3B82F6" />
            <Text style={[typography.title2, styles.metricVal, { color: colors.text }]}>
              {formatFriendlyDuration(entry?.durationMs || 0, locale)}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {t.summaryTotalDuration}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Ionicons name="fitness" size={24} color={colors.primary} />
            <Text style={[typography.title2, styles.metricVal, { color: colors.text }]}>
              {totalExercises}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {t.summaryExercisesDone}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Ionicons name="checkmark-done" size={24} color="#10B981" />
            <Text style={[typography.title2, styles.metricVal, { color: colors.text }]}>
              {totalSetsDone}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {t.summarySetsCompleted}
            </Text>
          </View>
        </View>

        {/* Detalhamento por Exercício */}
        {entry?.items && entry.items.length > 0 && (
          <View
            style={[
              styles.breakdownCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xxl,
                padding: spacing.lg,
                marginTop: spacing.lg,
              },
            ]}
          >
            <Text style={[typography.title3, { color: colors.text, marginBottom: 12 }]}>
              {t.setsBreakdown}
            </Text>
            {entry.items.map((item, idx) => {
              const rawName = entry.exercisesSnapshot?.[item.exerciseId]?.name;
              const name = rawName ? getLocalizedExerciseName(rawName, locale) : `${t.exerciseSingle} ${idx + 1}`;
              return (
                <View
                  key={idx}
                  style={[
                    styles.breakdownRow,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.text, flex: 1, fontWeight: '700', textTransform: 'capitalize' },
                    ]}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  <Text style={[typography.label, { color: colors.primary }]}>
                    {item.doneSets}/{item.plannedSets} {t.setsCount}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Botões de Ação */}
        <View style={styles.actionsRow}>
          <Button
            title={t.summaryBackHome}
            size="lg"
            onPress={() => router.replace('/(tabs)')}
            style={{ width: '100%', marginBottom: 12 }}
          />
          <Button
            title={t.summaryViewHistory}
            variant="secondary"
            size="md"
            onPress={() => router.replace('/history')}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricVal: {
    fontWeight: '900',
    marginVertical: 4,
  },
  breakdownCard: {
    width: '100%',
    borderWidth: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actionsRow: {
    width: '100%',
    marginTop: 28,
  },
});
