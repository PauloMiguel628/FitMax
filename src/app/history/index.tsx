import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useHistoryStore } from '@/store/historyStore';
import { showAppDialog } from '@/store/dialogStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDateTime } from '@/utils/date';
import { formatFriendlyDuration } from '@/utils/time';
import { getLocalizedWorkoutName } from '@/utils/exerciseLocalization';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/i18n';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const history = useHistoryStore((state) => state.history);
  const deleteHistoryEntry = useHistoryStore((state) => state.deleteHistoryEntry);

  const handleDelete = (id: string, name: string) => {
    const localizedName = getLocalizedWorkoutName(name, locale);
    showAppDialog(
      t.deleteHistoryTitle,
      t.deleteHistoryConfirm.replace('{name}', localizedName),
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.remove,
          style: 'destructive',
          onPress: () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            deleteHistoryEntry(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 14) }]}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceElevated }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typography.title2, styles.topBarTitle, { color: colors.text }]}>
          {t.historyTitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 30, 60) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const totalExercises = item.items.length;
          const totalSetsDone = item.items.reduce((acc, curr) => acc + curr.doneSets, 0);

          return (
            <View
              style={[
                styles.historyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.title3, { color: colors.text, fontWeight: '800' }]}>
                    {getLocalizedWorkoutName(item.workoutName, locale)}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                    {formatDateTime(item.finishedAt || item.startedAt, locale)}
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleDelete(item.id, item.workoutName)}
                  style={styles.deleteBtn}
                  accessibilityLabel={t.deleteHistoryTitle}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </Pressable>
              </View>

              <View style={[styles.statsRow, { marginTop: 12 }]}>
                <View style={styles.statPill}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={[typography.label, { color: colors.text, marginLeft: 4, fontSize: 12 }]}>
                    {formatFriendlyDuration(item.durationMs, locale)}
                  </Text>
                </View>

                <View style={styles.statPill}>
                  <Ionicons name="fitness-outline" size={16} color="#3B82F6" />
                  <Text style={[typography.label, { color: colors.text, marginLeft: 4, fontSize: 12 }]}>
                    {totalExercises} {t.exercises}
                  </Text>
                </View>

                <View style={styles.statPill}>
                  <Ionicons name="checkmark-done" size={16} color="#10B981" />
                  <Text style={[typography.label, { color: colors.text, marginLeft: 4, fontSize: 12 }]}>
                    {totalSetsDone} {t.setsCount}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={t.historyEmpty}
            subtitle={t.historyEmptySubtitle}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  historyCard: {
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteBtn: {
    padding: 6,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
