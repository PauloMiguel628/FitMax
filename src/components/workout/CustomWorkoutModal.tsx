import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Exercise, Workout } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/ui/Button';
import { getLocalizedExerciseName } from '@/utils/exerciseLocalization';
import {
  buildCustomWorkout,
  CUSTOM_WORKOUT_CATEGORIES,
  CustomWorkoutCategory,
  CustomWorkoutLevel,
  LEVEL_PARAMETERS,
} from '@/utils/customWorkoutGenerator';

interface CustomWorkoutModalProps {
  visible: boolean;
  initialLevel?: CustomWorkoutLevel;
  existingWorkouts: Workout[];
  availableExercises?: Exercise[];
  onClose: () => void;
  onCreateWorkout: (workoutData: Omit<Workout, 'id' | 'createdAt'>) => void;
}

export function CustomWorkoutModal({
  visible,
  initialLevel = 'iniciante',
  existingWorkouts,
  availableExercises,
  onClose,
  onCreateWorkout,
}: CustomWorkoutModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const [selectedLevel, setSelectedLevel] = useState<CustomWorkoutLevel>(initialLevel);
  const [selectedCategory, setSelectedCategory] = useState<CustomWorkoutCategory>('full-body');
  const [variationSeed, setVariationSeed] = useState<number>(0);

  const matchingWorkoutsCount = useMemo(() => {
    const catMeta = CUSTOM_WORKOUT_CATEGORIES.find((c) => c.id === selectedCategory);
    const lvlMeta = LEVEL_PARAMETERS[selectedLevel];
    if (!catMeta || !lvlMeta) return 0;

    const ptBase = `Treino Personalizado: ${catMeta.labelPt} (${lvlMeta.labelPt})`.toLowerCase();
    const enBase = `Custom Workout: ${catMeta.labelEn} (${lvlMeta.labelEn})`.toLowerCase();

    return existingWorkouts.filter((w) => {
      const n = w.name.toLowerCase();
      return n.startsWith(ptBase) || n.startsWith(enBase);
    }).length;
  }, [existingWorkouts, selectedCategory, selectedLevel]);

  const previewWorkout = useMemo(() => {
    return buildCustomWorkout({
      level: selectedLevel,
      category: selectedCategory,
      locale,
      variationSeed: variationSeed + matchingWorkoutsCount,
      existingWorkoutsCount: matchingWorkoutsCount,
      availableExercises,
    });
  }, [
    selectedLevel,
    selectedCategory,
    locale,
    variationSeed,
    matchingWorkoutsCount,
    availableExercises,
  ]);

  const totalPreviewSets = useMemo(
    () => previewWorkout.items.reduce((acc, item) => acc + item.plannedSets, 0),
    [previewWorkout.items]
  );

  const handleSelectLevel = (level: CustomWorkoutLevel) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedLevel(level);
  };

  const handleSelectCategory = (category: CustomWorkoutCategory) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedCategory(category);
  };

  const handleShuffle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setVariationSeed((prev) => prev + 1);
  };

  const handleConfirmCreate = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onCreateWorkout(previewWorkout);
  };

  const fullBodyOption = CUSTOM_WORKOUT_CATEGORIES[0];
  const muscleGroupOptions = CUSTOM_WORKOUT_CATEGORIES.slice(1);
  const isFullBodySelected = selectedCategory === 'full-body';

  const levelOptions: { key: CustomWorkoutLevel; label: string }[] = [
    { key: 'iniciante', label: t.profileLevelBeginner },
    { key: 'intermediario', label: t.profileLevelIntermediate },
    { key: 'avancado', label: t.profileLevelAdvanced },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderTopWidth: 1.5,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: Math.max(insets.bottom + 12, 24),
              maxHeight: '92%',
            },
          ]}
        >
          {/* Indicador de arraste */}
          <View style={styles.dragIndicatorWrap}>
            <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
          </View>

          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.title2, { color: colors.text }]}>
                {t.customWorkoutModalTitle}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                {t.customWorkoutModalSubtitle}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
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
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Seleção de Nível */}
            <Text style={[typography.label, styles.sectionLabel, { color: colors.textSecondary }]}>
              {t.customWorkoutSelectLevel}
            </Text>
            <View style={styles.levelRow}>
              {levelOptions.map((lvl) => {
                const active = selectedLevel === lvl.key;
                const params = LEVEL_PARAMETERS[lvl.key];
                return (
                  <Pressable
                    key={lvl.key}
                    onPress={() => handleSelectLevel(lvl.key)}
                    style={[
                      styles.levelBtn,
                      {
                        flex: lvl.key === 'intermediario' ? 1.28 : 1,
                        backgroundColor: active ? colors.primary : colors.surfaceElevated,
                        borderColor: active ? colors.primary : colors.border,
                        borderRadius: radius.xl,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                      style={[
                        typography.label,
                        {
                          color: active ? '#FFFFFF' : colors.text,
                          fontSize: 11,
                          fontWeight: '800',
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {lvl.label}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        typography.bodySmall,
                        {
                          color: active ? 'rgba(255,255,255,0.88)' : colors.textSecondary,
                          fontSize: 10,
                          marginTop: 2,
                        },
                      ]}
                    >
                      {params.sets} {t.setsCount} • {params.restSeconds}s
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 2. Seleção de Categoria / Grupo Muscular Alvo */}
            <Text
              style={[
                typography.label,
                styles.sectionLabel,
                { color: colors.textSecondary, marginTop: spacing.md },
              ]}
            >
              {t.customWorkoutSelectCategory}
            </Text>

            {/* Card Destaque Full-Body (Corpo Inteiro) */}
            <Pressable
              onPress={() => handleSelectCategory('full-body')}
              style={[
                styles.fullBodyCard,
                {
                  backgroundColor: isFullBodySelected ? colors.primaryMuted : colors.surfaceElevated,
                  borderColor: isFullBodySelected ? colors.primary : colors.border,
                  borderRadius: radius.xl,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isFullBodySelected }}
            >
              <View
                style={[
                  styles.fullBodyIconWrap,
                  {
                    backgroundColor: isFullBodySelected ? colors.primary : colors.surface,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <Ionicons
                  name="body-outline"
                  size={22}
                  color={isFullBodySelected ? '#FFFFFF' : colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={[
                    typography.bodyMedium,
                    {
                      color: colors.text,
                      fontWeight: '800',
                    },
                  ]}
                >
                  {locale === 'en' ? fullBodyOption.labelEn : fullBodyOption.labelPt}
                </Text>
                <Text
                  style={[
                    typography.bodySmall,
                    { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
                  ]}
                >
                  {t.customWorkoutFullBodyDesc}
                </Text>
              </View>
              <Ionicons
                name={isFullBodySelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={isFullBodySelected ? colors.primary : colors.textMuted}
              />
            </Pressable>

            {/* Grid das 8 Categorias de Grupos Musculares */}
            <View style={styles.categoriesGrid}>
              {muscleGroupOptions.map((cat) => {
                const active = selectedCategory === cat.id;
                const label = locale === 'en' ? cat.labelEn : cat.labelPt;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleSelectCategory(cat.id)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active ? colors.primaryMuted : colors.surfaceElevated,
                        borderColor: active ? colors.primary : colors.border,
                        borderRadius: radius.xl,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <View
                      style={[
                        styles.categoryChipIcon,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon as keyof typeof Ionicons.glyphMap}
                        size={16}
                        color={active ? '#FFFFFF' : colors.primary}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                      style={[
                        typography.bodySmall,
                        {
                          color: colors.text,
                          fontWeight: active ? '800' : '600',
                          flex: 1,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 3. Prévia do Treino que será criado */}
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                },
              ]}
            >
              <View style={styles.previewHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[typography.label, { color: colors.primary, fontSize: 10 }]}>
                    {t.customWorkoutPreviewTitle}
                  </Text>
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: colors.text, fontWeight: '800', marginTop: 2 },
                    ]}
                    numberOfLines={2}
                  >
                    {previewWorkout.name}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11, marginTop: 2 }]}>
                    {previewWorkout.items.length} {t.exercises} • {totalPreviewSets} {t.setsCount} •{' '}
                    {previewWorkout.defaultRestSeconds}
                    {t.customWorkoutRestInfo}
                  </Text>
                </View>

                <Pressable
                  onPress={handleShuffle}
                  style={[
                    styles.shuffleBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.full,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t.customWorkoutShuffleBtn}
                >
                  <Ionicons name="shuffle-outline" size={16} color={colors.primary} />
                  <Text
                    style={[
                      typography.label,
                      { color: colors.primary, fontSize: 10, marginLeft: 4 },
                    ]}
                  >
                    {t.customWorkoutShuffleBtn}
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.previewExercisesList, { borderTopColor: colors.border }]}>
                {previewWorkout.items.map((item, idx) => (
                  <View key={String(item.exercise.id) + '-' + idx} style={styles.previewExerciseRow}>
                    <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                    <Text
                      style={[
                        typography.bodySmall,
                        { color: colors.text, marginLeft: 6, flex: 1, fontSize: 12 },
                      ]}
                      numberOfLines={1}
                    >
                      {getLocalizedExerciseName(item.exercise.name, locale)}
                    </Text>
                    <Text
                      style={[
                        typography.bodySmall,
                        { color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginLeft: 8 },
                      ]}
                    >
                      {item.plannedSets}x{item.targetReps}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Rodapé fixo com Cancelar e Criar Treino */}
          <View style={[styles.footerRow, { paddingTop: spacing.sm }]}>
            <Button
              title={t.cancel}
              variant="secondary"
              size="md"
              onPress={onClose}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <Button
              title={t.customWorkoutCreateBtn}
              variant="primary"
              size="md"
              onPress={handleConfirmCreate}
              icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
              style={{ flex: 1.35 }}
            />
          </View>
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
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  dragIndicatorWrap: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 2,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullBodyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  fullBodyIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  categoryChip: {
    width: '48.6%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1.5,
  },
  categoryChipIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  previewBox: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  previewExercisesList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  previewExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
