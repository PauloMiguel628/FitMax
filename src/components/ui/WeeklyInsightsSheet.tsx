import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHistoryStore } from '@/store/historyStore';
import { calculateWeeklySummary } from '@/utils/date';
import { formatFriendlyDuration } from '@/utils/time';
import { useTranslation } from '@/i18n';
import { Button } from './Button';

interface WeeklyInsightsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function WeeklyInsightsSheet({ visible, onClose }: WeeklyInsightsSheetProps) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();
  const history = useHistoryStore((state) => state.history);
  const loginDates = useHistoryStore((state) => state.loginDates);
  const recordLoginToday = useHistoryStore((state) => state.recordLoginToday);

  useEffect(() => {
    if (visible) {
      recordLoginToday();
    }
  }, [visible, recordLoginToday]);

  const summary = calculateWeeklySummary(history, locale, loginDates);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              padding: spacing.xl,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.title2, { color: colors.text }]}>
                {t.weeklyTitle}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                {t.weeklySubtitle}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.surfaceElevated, borderRadius: radius.full },
              ]}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Destaque de Dias Seguidos Logado */}
          <View
            style={[
              styles.streakHighlightBox,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primary,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Ionicons name="flame" size={22} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '800', marginLeft: 8, flex: 1 }]}>
              {summary.loginStreakDays} {t.weeklyLoginStreakBadge}
            </Text>
            <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
          </View>

          {/* Cards de Métricas */}
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="barbell" size={22} color={colors.primary} />
              <Text style={[typography.title1, styles.statValue, { color: colors.text }]}>
                {summary.workoutsCount}
              </Text>
              <Text style={[typography.bodySmall, styles.statLabel, { color: colors.textSecondary }]}>
                {t.weeklyWorkoutsCount}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="time" size={22} color="#3B82F6" />
              <Text style={[typography.title2, styles.statValue, { color: colors.text, marginTop: 4 }]}>
                {formatFriendlyDuration(summary.totalDurationMs, locale)}
              </Text>
              <Text style={[typography.bodySmall, styles.statLabel, { color: colors.textSecondary }]}>
                {t.weeklyTotalTime}
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: radius.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="trophy" size={22} color="#F59E0B" />
              <Text style={[typography.title1, styles.statValue, { color: colors.text }]}>
                {summary.loginStreakDays}
              </Text>
              <Text style={[typography.bodySmall, styles.statLabel, { color: colors.textSecondary }]}>
                {t.weeklyStreak}
              </Text>
            </View>
          </View>

          {/* Gráfico de barras dos 7 dias (Treinos + Dias Logados) */}
          <View style={styles.chartSection}>
            <Text
              style={[
                typography.label,
                { color: colors.textSecondary, marginBottom: spacing.sm },
              ]}
            >
              {t.weeklyDaysActive}
            </Text>
            <View style={styles.daysRow}>
              {summary.dailyCounts.map((item, idx) => {
                const hasTrained = item.count > 0;
                const isLogged = item.loggedIn;
                return (
                  <View key={idx} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dayBar,
                        {
                          backgroundColor: hasTrained
                            ? colors.primary
                            : isLogged
                            ? colors.success
                            : colors.surfaceElevated,
                          borderColor: hasTrained
                            ? colors.primaryLight
                            : isLogged
                            ? colors.success
                            : colors.border,
                          height: hasTrained ? 52 : isLogged ? 34 : 16,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        typography.bodySmall,
                        styles.dayText,
                        {
                          color: hasTrained
                            ? colors.primary
                            : isLogged
                            ? colors.success
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Legenda do gráfico */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
                  {t.weeklyLegendTrained}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
                  {t.weeklyLegendLogged}
                </Text>
              </View>
            </View>

            <View style={styles.savedNoteRow}>
              <Ionicons name="cloud-done-outline" size={14} color={colors.textMuted} />
              <Text style={[typography.bodySmall, { color: colors.textMuted, fontSize: 11, marginLeft: 6 }]}>
                {t.weeklySavedNote}
              </Text>
            </View>
          </View>

          <Button
            title={t.close}
            variant="secondary"
            onPress={onClose}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakHighlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontWeight: '800',
    marginVertical: 2,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
  chartSection: {
    marginVertical: 4,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 76,
    paddingHorizontal: 8,
  },
  dayCol: {
    alignItems: 'center',
    width: 34,
  },
  dayBar: {
    width: 14,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 6,
  },
  dayText: {
    fontWeight: '700',
    fontSize: 11,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  savedNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
