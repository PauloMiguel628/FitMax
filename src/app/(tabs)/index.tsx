import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Header } from '@/components/ui/Header';
import { BannerCarousel } from '@/components/ui/BannerCarousel';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { WeeklyInsightsSheet } from '@/components/ui/WeeklyInsightsSheet';
import { ACTIVE_CATEGORIES, CATEGORY_METADATA } from '@/config/home-friendly';
import { useSessionStore } from '@/store/sessionStore';
import { useTranslation } from '@/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();
  const [weeklySheetVisible, setWeeklySheetVisible] = useState(false);

  const currentSession = useSessionStore((state) => state.currentSession);

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/category/[bodyPart]',
      params: { bodyPart: category },
    });
  };

  const handleResumeSession = () => {
    if (currentSession) {
      router.push({
        pathname: '/workout/[id]/session',
        params: { id: currentSession.workoutId },
      });
    }
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho "READY TO WORKOUT" + Avatar + Sino */}
        <Header onPressBell={() => setWeeklySheetVisible(true)} />

        {/* Banner de retomada caso haja treino no meio da sessão */}
        {currentSession && (
          <Pressable
            onPress={handleResumeSession}
            style={[
              styles.resumeBanner,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primary,
                borderRadius: radius.xl,
                marginHorizontal: spacing.lg,
                marginBottom: spacing.md,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.resumeIconWrap}>
              <Ionicons name="play-circle" size={28} color={colors.primary} />
            </View>
            <View style={styles.resumeTextWrap}>
              <Text style={[typography.title3, { color: colors.primary, fontSize: 15 }]}>
                {t.sessionResumePrompt}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                {currentSession.workoutName}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}

        {/* Carrossel Horizontal de Banners de Treino */}
        <BannerCarousel />

        {/* Seção "Exercises" */}
        <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}>
          <Text
            style={[
              typography.title2,
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            {t.homeExercises}
          </Text>
          <Text
            style={[
              typography.bodySmall,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
          >
            {t.homeCategoriesSubtitle}
          </Text>
        </View>

        {/* Grade de 2 colunas com cards de categoria */}
        <View style={[styles.gridContainer, { paddingHorizontal: spacing.md }]}>
          {ACTIVE_CATEGORIES.map((category) => {
            const meta = CATEGORY_METADATA[category];
            if (!meta) return null;
            const categoryName = locale === 'en' ? meta.displayNameEn : meta.displayNamePt;

            return (
              <View key={category} style={styles.gridColumn}>
                <CategoryCard
                  id={category}
                  name={categoryName}
                  coverUrl={meta.coverUrl}
                  onPress={() => handleCategoryPress(category)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sheet com o resumo da semana (ativado pelo sino) */}
      <WeeklyInsightsSheet
        visible={weeklySheetVisible}
        onClose={() => setWeeklySheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  resumeIconWrap: {
    marginRight: 10,
  },
  resumeTextWrap: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridColumn: {
    width: '50%',
  },
});
