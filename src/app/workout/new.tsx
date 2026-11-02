import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Exercise, WorkoutItem } from '@/types';
import { ExerciseService } from '@/services/exerciseService';
import { useWorkoutStore } from '@/store/workoutStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/components/ui/Button';
import { ACTIVE_CATEGORIES, CATEGORY_METADATA, matchesExerciseCategory } from '@/config/home-friendly';
import { useTranslation } from '@/i18n';
import { getLocalizedExerciseName, getLocalizedTarget } from '@/utils/exerciseLocalization';

export default function NewWorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const addWorkout = useWorkoutStore((state) => state.addWorkout);
  const favorites = useFavoritesStore((state) => state.favorites);

  const [workoutName, setWorkoutName] = useState('');
  const [defaultRestSeconds, setDefaultRestSeconds] = useState<number>(60);
  const [items, setItems] = useState<WorkoutItem[]>([]);

  // Modal Seletor de Exercícios
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [filterFavsOnly, setFilterFavsOnly] = useState(false);

  useEffect(() => {
    ExerciseService.getAllExercises().then(setAllExercises);
  }, []);

  const handleToggleExerciseInSelector = (exercise: Exercise) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const existingIndex = items.findIndex((it) => String(it.exercise.id) === String(exercise.id));
    if (existingIndex >= 0) {
      setItems(items.filter((_, i) => i !== existingIndex));
    } else {
      setItems([
        ...items,
        {
          exercise,
          plannedSets: 3,
          targetReps: 12,
          restSeconds: defaultRestSeconds,
        },
      ]);
    }
  };

  const isExerciseSelected = (id: string) => {
    return items.some((it) => String(it.exercise.id) === String(id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setItems(copy);
  };

  const handleRemove = (index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateSets = (index: number, delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const copy = [...items];
    copy[index].plannedSets = Math.max(1, copy[index].plannedSets + delta);
    setItems(copy);
  };

  const handleUpdateItemRest = (index: number, deltaSeconds: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const copy = [...items];
    const currentRest = copy[index].restSeconds ?? defaultRestSeconds;
    copy[index].restSeconds = Math.max(15, Math.min(300, currentRest + deltaSeconds));
    setItems(copy);
  };

  const handleSelectDefaultRest = (sec: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setDefaultRestSeconds(sec);
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        restSeconds: it.restSeconds === defaultRestSeconds ? sec : it.restSeconds ?? sec,
      }))
    );
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      Alert.alert(t.error, t.validationWorkoutNameRequired);
      return;
    }
    if (items.length === 0) {
      Alert.alert(t.error, t.validationWorkoutExercisesRequired);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    addWorkout({
      name: workoutName.trim(),
      defaultRestSeconds,
      items,
    });

    router.back();
  };

  const filteredInModal = allExercises.filter((ex) => {
    if (filterFavsOnly && !favorites.some((f) => String(f.id) === String(ex.id))) {
      return false;
    }
    if (selectedCat !== 'all' && !matchesExerciseCategory(ex, selectedCat)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const ptName = getLocalizedExerciseName(ex.name, locale).toLowerCase();
      const ptTarget = getLocalizedTarget(ex.target, locale).toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.target.toLowerCase().includes(q) ||
        ptName.includes(q) ||
        ptTarget.includes(q)
      );
    }
    return true;
  });

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 14) }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceElevated }]}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typography.title2, styles.topBarTitle, { color: colors.text }]}>
          {t.createWorkout}
        </Text>
        <Button title={t.saveWorkout} size="sm" onPress={handleSave} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 40, 60) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Nome do Treino */}
        <View style={styles.section}>
          <Text style={[typography.label, { color: colors.textSecondary, marginBottom: 6 }]}>
            {t.workoutName}
          </Text>
          <TextInput
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder={t.workoutNamePlaceholder}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.nameInput,
              typography.bodyLarge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                borderRadius: radius.lg,
              },
            ]}
          />

          {/* Descanso Padrão do Treino */}
          <Text style={[typography.label, { color: colors.textSecondary, marginTop: 14, marginBottom: 8 }]}>
            {t.workoutDefaultRestLabel}: <Text style={{ color: colors.primary }}>{defaultRestSeconds}s</Text>
          </Text>
          <View style={styles.restPresetsRow}>
            {[30, 45, 60, 90, 120].map((sec) => {
              const active = defaultRestSeconds === sec;
              return (
                <Pressable
                  key={sec}
                  onPress={() => handleSelectDefaultRest(sec)}
                  style={[
                    styles.restPresetChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceElevated,
                      borderColor: active ? colors.primary : colors.border,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.label,
                      { color: active ? '#FFFFFF' : colors.text, fontSize: 11 },
                    ]}
                  >
                    {sec}s
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Lista de Exercícios Adicionados */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[typography.title3, { color: colors.text, flex: 1, marginRight: 8 }]} numberOfLines={1}>
              {t.selectedExercises} ({items.length})
            </Text>
            <Button
              title={t.addExercisesBtn}
              size="sm"
              variant="outline"
              onPress={() => setSelectorVisible(true)}
              icon={<Ionicons name="add" size={16} color={colors.primary} />}
              style={{ flexShrink: 0 }}
            />
          </View>

          {items.map((item, index) => (
            <View
              key={item.exercise.id + '-' + index}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.itemMainRow}>
                <View style={styles.itemOrderCol}>
                  <Pressable
                    disabled={index === 0}
                    onPress={() => handleMove(index, 'up')}
                    style={[styles.arrowBtn, { opacity: index === 0 ? 0.3 : 1 }]}
                  >
                    <Ionicons name="chevron-up" size={18} color={colors.text} />
                  </Pressable>
                  <Text style={[typography.label, { color: colors.textSecondary, fontSize: 11 }]}>
                    #{index + 1}
                  </Text>
                  <Pressable
                    disabled={index === items.length - 1}
                    onPress={() => handleMove(index, 'down')}
                    style={[styles.arrowBtn, { opacity: index === items.length - 1 ? 0.3 : 1 }]}
                  >
                    <Ionicons name="chevron-down" size={18} color={colors.text} />
                  </Pressable>
                </View>

                <View style={styles.itemInfoCol}>
                  <Text
                    style={[typography.bodyMedium, styles.exerciseNameText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {getLocalizedExerciseName(item.exercise.name, locale)}
                  </Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                    {t.targetLabel}: {getLocalizedTarget(item.exercise.target, locale)}
                  </Text>

                  {/* Stepper de Séries Planejadas e Descanso por Exercício */}
                  <View style={styles.stepperRow}>
                    <Text style={[typography.label, { color: colors.textSecondary, fontSize: 11 }]}>
                      {t.plannedSets}:
                    </Text>
                    <View style={styles.stepperControls}>
                      <Pressable
                        onPress={() => handleUpdateSets(index, -1)}
                        style={[styles.stepBtn, { backgroundColor: colors.surfaceElevated }]}
                      >
                        <Ionicons name="remove" size={16} color={colors.text} />
                      </Pressable>
                      <Text style={[typography.title3, styles.stepValueText, { color: colors.primary }]}>
                        {item.plannedSets}
                      </Text>
                      <Pressable
                        onPress={() => handleUpdateSets(index, 1)}
                        style={[styles.stepBtn, { backgroundColor: colors.surfaceElevated }]}
                      >
                        <Ionicons name="add" size={16} color={colors.text} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.stepperRow}>
                    <Text style={[typography.label, { color: colors.textSecondary, fontSize: 11 }]}>
                      {t.exerciseRestLabel}:
                    </Text>
                    <View style={styles.stepperControls}>
                      <Pressable
                        onPress={() => handleUpdateItemRest(index, -15)}
                        style={[styles.stepBtn, { backgroundColor: colors.surfaceElevated }]}
                      >
                        <Ionicons name="remove" size={16} color={colors.text} />
                      </Pressable>
                      <Text style={[typography.bodySmall, styles.stepValueText, { color: colors.primary, fontWeight: '800', minWidth: 34 }]}>
                        {item.restSeconds ?? defaultRestSeconds}s
                      </Text>
                      <Pressable
                        onPress={() => handleUpdateItemRest(index, 15)}
                        style={[styles.stepBtn, { backgroundColor: colors.surfaceElevated }]}
                      >
                        <Ionicons name="add" size={16} color={colors.text} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleRemove(index)}
                  style={styles.deleteItemBtn}
                  accessibilityLabel={t.remove}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))}

          {items.length === 0 && (
            <Pressable
              onPress={() => setSelectorVisible(true)}
              style={[
                styles.emptyAddBox,
                {
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 8 }]}>
                {t.addFirstExercisesPrompt}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Modal Multi-seletor de Exercícios */}
      <Modal
        visible={selectorVisible}
        animationType="slide"
        onRequestClose={() => setSelectorVisible(false)}
      >
        <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 14) }]}>
          <View style={[styles.topBar, { paddingHorizontal: spacing.lg }]}>
            <Text style={[typography.title2, { color: colors.text }]}>
              {t.addExercises} ({items.length})
            </Text>
            <Button
              title={t.done}
              size="sm"
              onPress={() => setSelectorVisible(false)}
            />
          </View>

          {/* Busca no Modal */}
          <View style={{ paddingHorizontal: spacing.lg }}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t.searchExercisePlaceholder}
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, typography.bodyMedium, { color: colors.text }]}
              />
            </View>

            {/* Chips de Categorias e Favoritos */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10, gap: 8 }}
            >
              <Pressable
                onPress={() => setFilterFavsOnly(!filterFavsOnly)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterFavsOnly ? colors.primary : colors.surfaceElevated,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Ionicons
                  name={filterFavsOnly ? 'heart' : 'heart-outline'}
                  size={14}
                  color={filterFavsOnly ? '#FFFFFF' : colors.primary}
                />
                <Text
                  style={[
                    typography.label,
                    { color: filterFavsOnly ? '#FFFFFF' : colors.text, fontSize: 11, marginLeft: 4 },
                  ]}
                >
                  {t.favoritesTitle}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setSelectedCat('all');
                  setFilterFavsOnly(false);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      !filterFavsOnly && selectedCat === 'all'
                        ? colors.primary
                        : colors.surfaceElevated,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.label,
                    {
                      color:
                        !filterFavsOnly && selectedCat === 'all'
                          ? '#FFFFFF'
                          : colors.text,
                      fontSize: 11,
                    },
                  ]}
                >
                  {t.all}
                </Text>
              </Pressable>

              {ACTIVE_CATEGORIES.map((cat) => {
                const isSel = !filterFavsOnly && selectedCat === cat;
                const label = locale === 'en'
                  ? (CATEGORY_METADATA[cat]?.displayNameEn || cat)
                  : (CATEGORY_METADATA[cat]?.displayNamePt || cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setSelectedCat(cat);
                      setFilterFavsOnly(false);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSel ? colors.primary : colors.surfaceElevated,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.label,
                        { color: isSel ? '#FFFFFF' : colors.text, fontSize: 11 },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Lista de Seleção */}
          <FlatList
            data={filteredInModal}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom + 30, 40) }}
            renderItem={({ item }) => {
              const selected = isExerciseSelected(String(item.id));
              return (
                <Pressable
                  onPress={() => handleToggleExerciseInSelector(item)}
                  style={[
                    styles.selectorRow,
                    {
                      backgroundColor: selected ? colors.primaryMuted : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                      borderRadius: radius.lg,
                    },
                  ]}
                >
                  <View style={styles.selectorCheckCol}>
                    <Ionicons
                      name={selected ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <View style={styles.selectorTextCol}>
                    <Text
                      style={[
                        typography.bodyLarge,
                        { color: colors.text, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {getLocalizedExerciseName(item.name, locale)}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                      {getLocalizedTarget(item.target, locale)}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 14,
  },
  restPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCard: {
    borderWidth: 1,
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemOrderCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 8,
  },
  arrowBtn: {
    padding: 2,
  },
  itemInfoCol: {
    flex: 1,
  },
  exerciseNameText: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValueText: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteItemBtn: {
    padding: 8,
  },
  emptyAddBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectorCheckCol: {
    marginRight: 12,
  },
  selectorTextCol: {
    flex: 1,
  },
});
