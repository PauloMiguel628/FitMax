import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfileStore } from '@/store/profileStore';
import { useHistoryStore } from '@/store/historyStore';
import { calculateBmi } from '@/utils/bmi';
import { BmiGauge } from '@/components/charts/BmiGauge';
import { WeightChart } from '@/components/charts/WeightChart';
import { Button } from '@/components/ui/Button';
import { formatFriendlyDuration } from '@/utils/time';
import { formatDateTime } from '@/utils/date';
import { useTranslation } from '@/i18n';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, setThemeMode, spacing, radius, typography } = useAppTheme();
  const { t, locale } = useTranslation();

  const profile = useProfileStore((state) => state.profile);
  const weightHistory = useProfileStore((state) => state.weightHistory);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const addWeightEntry = useProfileStore((state) => state.addWeightEntry);
  const removeWeightEntry = useProfileStore((state) => state.removeWeightEntry);
  const setLocale = useProfileStore((state) => state.setLocale);

  const history = useHistoryStore((state) => state.history);

  // Estados de edição do perfil
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [weightStr, setWeightStr] = useState(String(profile.weightKg || 74));
  const [heightStr, setHeightStr] = useState(String(profile.heightCm || 176));
  const [ageStr, setAgeStr] = useState(String(profile.age || 26));
  const [selectedGoal, setSelectedGoal] = useState(profile.goal || 'Ganhar massa e definição');
  const [selectedLevel, setSelectedLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>(
    (profile.level as 'iniciante' | 'intermediario' | 'avancado') || 'intermediario'
  );

  // Estados do Simulador de IMC
  const [isSimulating, setIsSimulating] = useState(false);
  const [simWeightStr, setSimWeightStr] = useState(String(profile.weightKg || 74));
  const [simHeightStr, setSimHeightStr] = useState(String(profile.heightCm || 176));

  // Modal para Registro Rápido de Peso (Totalmente compatível com Android e iOS)
  const [quickWeightModalVisible, setQuickWeightModalVisible] = useState(false);
  const [quickWeightInput, setQuickWeightInput] = useState(String(profile.weightKg || 74));

  // IMC atual do perfil
  const realBmi = calculateBmi(profile.weightKg || 74, profile.heightCm || 176);

  // IMC simulado
  const simulatedWeight = parseFloat(simWeightStr) || 0;
  const simulatedHeight = parseFloat(simHeightStr) || 0;
  const simBmi = isSimulating ? calculateBmi(simulatedWeight, simulatedHeight) : realBmi;

  // Estatísticas de treinos concluídos (inicia zerado para novos usuários)
  const totalWorkouts = history.length;
  const totalDurationMs = history.reduce((acc, h) => acc + (h.durationMs || 0), 0);

  const getLocalizedLevel = (lvl?: string) => {
    switch (lvl) {
      case 'iniciante':
        return t.profileLevelBeginner;
      case 'intermediario':
        return t.profileLevelIntermediate;
      case 'avancado':
        return t.profileLevelAdvanced;
      default:
        return t.profileLevelIntermediate;
    }
  };

  const getLocalizedGoal = (goalStr?: string) => {
    if (!goalStr) return t.profileGoalGainMuscle;
    const lower = goalStr.toLowerCase();
    if (lower.includes('perder') || lower.includes('queimar') || lower.includes('fat') || lower.includes('lose')) {
      return t.profileGoalLoseWeight;
    }
    if (lower.includes('condicionamento') || lower.includes('conditioning')) {
      return t.profileGoalConditioning;
    }
    return t.profileGoalGainMuscle;
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateProfile({ photoUri: result.assets[0].uri });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.warn('Erro ao abrir galeria:', e);
    }
  };

  const handleSaveProfile = () => {
    const w = parseFloat(weightStr.replace(',', '.'));
    const h = parseFloat(heightStr.replace(',', '.'));
    const a = parseInt(ageStr, 10);

    if (!name.trim()) {
      Alert.alert(t.error, t.validationNameRequired);
      return;
    }
    if (isNaN(w) || w < 20 || w > 400) {
      Alert.alert(t.error, t.validationWeightRange);
      return;
    }
    if (isNaN(h) || h < 80 || h > 250) {
      Alert.alert(t.error, t.validationHeightRange);
      return;
    }
    if (isNaN(a) || a < 10 || a > 120) {
      Alert.alert(t.error, t.validationAgeRange);
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Atualiza apenas os dados do perfil (novos registros de peso na evolução são feitos pelo usuário no botão + Registrar)
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      weightKg: w,
      heightCm: h,
      age: a,
      goal: selectedGoal,
      level: selectedLevel,
    });

    setIsEditing(false);
  };

  const handleSelectLevelQuick = (lvl: 'iniciante' | 'intermediario' | 'avancado') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedLevel(lvl);
    updateProfile({ level: lvl });
  };

  const handleQuickAddWeight = () => {
    setQuickWeightInput(String(profile.weightKg || 74));
    setQuickWeightModalVisible(true);
  };

  const handleSaveQuickWeight = () => {
    const w = parseFloat((quickWeightInput || '').replace(',', '.'));
    if (!isNaN(w) && w >= 20 && w <= 400) {
      addWeightEntry(w);
      updateProfile({ weightKg: w });
      setWeightStr(String(w));
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setQuickWeightModalVisible(false);
    } else {
      Alert.alert(t.error, t.validationWeightRange);
    }
  };

  const handleDeleteWeightEntry = (id: string, dateOrIso: string) => {
    Alert.alert(
      t.weightHistoryDeleteConfirm,
      `${formatDateTime(dateOrIso, locale)}`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.remove,
          style: 'destructive',
          onPress: () => {
            removeWeightEntry(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho do Perfil com Avatar e Nome */}
        <View style={[styles.profileHeader, { paddingHorizontal: spacing.lg }]}>
          <View style={styles.avatarWrapper}>
            <Pressable onPress={handlePickPhoto} style={styles.avatarButton}>
              {profile.photoUri ? (
                <Image
                  source={{ uri: profile.photoUri }}
                  style={[styles.avatar, { borderColor: colors.primary, borderRadius: radius.full }]}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.surfaceElevated, borderRadius: radius.full },
                  ]}
                >
                  <Ionicons name="person" size={44} color={colors.textSecondary} />
                </View>
              )}
              <View
                style={[
                  styles.cameraBadge,
                  { backgroundColor: colors.primary, borderColor: colors.background },
                ]}
              >
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          <Text style={[typography.title1, styles.userName, { color: colors.text }]}>
            {profile.name}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            {getLocalizedGoal(profile.goal)} • {t.profileLevel}: {getLocalizedLevel(profile.level)}
          </Text>

          {/* Descrição / Bio do Perfil */}
          {Boolean(profile.bio && profile.bio.trim()) && (
            <View
              style={[
                styles.bioBadgeBox,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                },
              ]}
            >
              <Text
                style={[
                  typography.bodySmall,
                  { color: colors.text, textAlign: 'center', fontStyle: 'italic' },
                ]}
              >
                &ldquo;{profile.bio}&rdquo;
              </Text>
            </View>
          )}

          {/* Seletor Rápido de Nível do Usuário (Iniciante, Intermediário, Avançado) */}
          <View style={styles.levelQuickRow}>
            {(
              [
                { key: 'iniciante', label: t.profileLevelBeginner },
                { key: 'intermediario', label: t.profileLevelIntermediate },
                { key: 'avancado', label: t.profileLevelAdvanced },
              ] as const
            ).map((lvlObj) => {
              const isSelected = (profile.level || 'intermediario') === lvlObj.key;
              return (
                <Pressable
                  key={lvlObj.key}
                  onPress={() => handleSelectLevelQuick(lvlObj.key)}
                  style={[
                    styles.levelPillBtn,
                    {
                      flex: lvlObj.key === 'intermediario' ? 1.28 : 1,
                      backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.full,
                    },
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                    style={[
                      typography.label,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontSize: 11,
                        letterSpacing: 0.2,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {lvlObj.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title={isEditing ? t.profileSave : t.profileEdit}
            variant={isEditing ? 'primary' : 'outline'}
            size="sm"
            onPress={
              isEditing
                ? handleSaveProfile
                : () => {
                    setName(profile.name);
                    setBio(profile.bio || '');
                    setWeightStr(String(profile.weightKg || 74));
                    setHeightStr(String(profile.heightCm || 176));
                    setAgeStr(String(profile.age || 26));
                    setSelectedLevel(
                      (profile.level as 'iniciante' | 'intermediario' | 'avancado') || 'intermediario'
                    );
                    setSelectedGoal(profile.goal || 'Ganhar massa e definição');
                    setIsEditing(true);
                  }
            }
            style={{ marginTop: 14 }}
          />
        </View>

        {/* Formulário de Edição do Perfil */}
        {isEditing && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.xxl,
                marginHorizontal: spacing.lg,
                marginTop: spacing.md,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={[typography.title3, { color: colors.text, marginBottom: 12 }]}>
              {t.profileEdit}
            </Text>

            <View>
              <Text style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}>
                {t.profileName}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={[styles.input, typography.bodyMedium, { color: colors.text, borderColor: colors.border }]}
              />
            </View>

            <View>
              <Text style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}>
                {t.profileBio}
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder={t.profileBioPlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={160}
                style={[
                  styles.input,
                  styles.bioInput,
                  typography.bodyMedium,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}>
                {t.profileLevel}
              </Text>
              <View style={styles.editSelectorRow}>
                {(
                  [
                    { key: 'iniciante', label: t.profileLevelBeginner },
                    { key: 'intermediario', label: t.profileLevelIntermediate },
                    { key: 'avancado', label: t.profileLevelAdvanced },
                  ] as const
                ).map((lvlObj) => {
                  const active = selectedLevel === lvlObj.key;
                  return (
                    <Pressable
                      key={lvlObj.key}
                      onPress={() => setSelectedLevel(lvlObj.key)}
                      style={[
                        styles.editSelectorOption,
                        {
                          flex: lvlObj.key === 'intermediario' ? 1.32 : 1,
                          backgroundColor: active ? colors.primary : colors.surfaceElevated,
                          borderColor: active ? colors.primary : colors.border,
                          borderRadius: radius.lg,
                        },
                      ]}
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
                            letterSpacing: 0.1,
                            textAlign: 'center',
                          },
                        ]}
                      >
                        {lvlObj.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}>
                {t.profileGoal}
              </Text>
              <View style={styles.goalSelectorColumn}>
                {[
                  { value: 'Ganhar massa e definição', label: t.profileGoalGainMuscle },
                  { value: 'Perder peso / Queimar gordura', label: t.profileGoalLoseWeight },
                  { value: 'Condicionamento físico', label: t.profileGoalConditioning },
                ].map((gObj) => {
                  const active = getLocalizedGoal(selectedGoal) === gObj.label;
                  return (
                    <Pressable
                      key={gObj.value}
                      onPress={() => setSelectedGoal(gObj.value)}
                      style={[
                        styles.goalOptionBtn,
                        {
                          backgroundColor: active ? colors.primaryMuted : colors.surfaceElevated,
                          borderColor: active ? colors.primary : colors.border,
                          borderRadius: radius.lg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          typography.bodySmall,
                          {
                            color: active ? colors.text : colors.textSecondary,
                            fontWeight: active ? '700' : '500',
                            marginLeft: 8,
                          },
                        ]}
                      >
                        {gObj.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.inputCol}>
                <Text
                  style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {t.profileWeight}
                </Text>
                <TextInput
                  value={weightStr}
                  onChangeText={setWeightStr}
                  keyboardType="numeric"
                  style={[styles.input, typography.bodyMedium, { color: colors.text, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.inputCol}>
                <Text
                  style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {t.profileHeight}
                </Text>
                <TextInput
                  value={heightStr}
                  onChangeText={setHeightStr}
                  keyboardType="numeric"
                  style={[styles.input, typography.bodyMedium, { color: colors.text, borderColor: colors.border }]}
                />
              </View>
            </View>

            <View>
              <Text style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}>
                {t.profileAge}
              </Text>
              <TextInput
                value={ageStr}
                onChangeText={setAgeStr}
                keyboardType="numeric"
                style={[styles.input, typography.bodyMedium, { color: colors.text, borderColor: colors.border }]}
              />
            </View>

            <Button
              title={t.profileSave}
              size="md"
              onPress={handleSaveProfile}
              style={{ marginTop: 4 }}
            />
          </View>
        )}

        {/* Resumo de Atividades Concluídas (Começa com 0 para novos usuários) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xxl,
              marginHorizontal: spacing.lg,
              marginTop: spacing.md,
              padding: spacing.lg,
            },
          ]}
        >
          <Text style={[typography.title3, { color: colors.text, marginBottom: 12 }]}>
            {t.summaryExercisesDone}
          </Text>

          <View style={styles.summaryStatsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderRadius: radius.xl }]}>
              <Text style={[typography.title1, { color: colors.primary }]}>
                {totalWorkouts}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                {t.completedWorkouts}
              </Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderRadius: radius.xl }]}>
              <Text style={[typography.title2, { color: '#3B82F6', marginTop: 4 }]}>
                {totalWorkouts > 0 ? formatFriendlyDuration(totalDurationMs, locale) : '0m'}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                {t.totalTime}
              </Text>
            </View>
          </View>
        </View>

        {/* SEÇÃO 2.2: CALCULADORA DE IMC (Com botão compacto que nunca estoura) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xxl,
              marginHorizontal: spacing.lg,
              marginTop: spacing.md,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.cardHeaderWithToggle}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[typography.title3, { color: colors.text }]} numberOfLines={1}>
                {t.bmiTitle}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>
                {isSimulating ? t.simulationMode : t.bmiYourScore}
              </Text>
            </View>

            <Pressable
              onPress={() => setIsSimulating(!isSimulating)}
              style={[
                styles.simulateToggle,
                {
                  backgroundColor: isSimulating ? colors.primary : colors.surfaceElevated,
                  borderColor: isSimulating ? colors.primary : colors.border,
                  borderRadius: radius.full,
                },
              ]}
              accessibilityRole="button"
            >
              <Ionicons
                name={isSimulating ? 'refresh' : 'calculator-outline'}
                size={15}
                color={isSimulating ? '#FFFFFF' : colors.primary}
              />
              <Text
                style={[
                  typography.label,
                  { color: isSimulating ? '#FFFFFF' : colors.text, fontSize: 11, marginLeft: 4 },
                ]}
              >
                {isSimulating ? t.myBmiBtn : t.simulateBtn}
              </Text>
            </Pressable>
          </View>

          {/* Medidor Animado de IMC com arco e cores OMS */}
          <BmiGauge bmi={simBmi} />

          {/* Controles de Simulação (se ativado) */}
          {isSimulating && (
            <View style={[styles.simControls, { backgroundColor: colors.surfaceElevated, borderRadius: radius.xl }]}>
              <View style={styles.rowInputs}>
                <View style={styles.inputCol}>
                  <Text
                    style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {t.bmiWeightSim}
                  </Text>
                  <TextInput
                    value={simWeightStr}
                    onChangeText={setSimWeightStr}
                    keyboardType="numeric"
                    style={[styles.input, typography.bodyMedium, { color: colors.text, borderColor: colors.border }]}
                  />
                </View>

                <View style={styles.inputCol}>
                  <Text
                    style={[typography.label, styles.inputLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {t.bmiHeightSim}
                  </Text>
                  <TextInput
                    value={simHeightStr}
                    onChangeText={setSimHeightStr}
                    keyboardType="numeric"
                    style={[styles.input, typography.bodyMedium, { color: colors.text, borderColor: colors.border }]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Aviso Obrigatório e Curto de Isenção Médica */}
          <View
            style={[
              styles.disclaimerBox,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
            <Text style={[typography.bodySmall, styles.disclaimerText, { color: colors.textSecondary }]}>
              {t.bmiDisclaimer}
            </Text>
          </View>
        </View>

        {/* HISTÓRICO DE PESO & GRÁFICO (Com botão direto para adicionar peso) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xxl,
              marginHorizontal: spacing.lg,
              marginTop: spacing.md,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.cardHeaderWithToggle}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[typography.title3, { color: colors.text }]}>
                {t.weightHistoryTitle}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                {weightHistory.length} {t.weightEntriesCount}
              </Text>
            </View>

            <Pressable
              onPress={handleQuickAddWeight}
              style={[
                styles.simulateToggle,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.full,
                },
              ]}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[typography.label, { color: colors.primary, fontSize: 11, marginLeft: 2 }]}>
                {t.logWeightBtn}
              </Text>
            </Pressable>
          </View>

          {/* Gráfico de Linha SVG */}
          {weightHistory.length > 0 ? (
            <WeightChart entries={weightHistory} />
          ) : (
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginVertical: 12 }]}>
              {t.weightHistoryEmpty}
            </Text>
          )}

          {/* Lista de Registros com data, hora e opção de excluir */}
          <View style={styles.weightEntriesList}>
            {[...weightHistory].reverse().map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.weightEntryRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.weightEntryInfo}>
                  <View style={styles.weightValueRow}>
                    <Ionicons name="scale-outline" size={16} color={colors.primary} />
                    <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '800', marginLeft: 6 }]}>
                      {entry.weightKg} kg
                    </Text>
                  </View>
                  <View style={styles.weightTimestampRow}>
                    <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                    <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 4 }]}>
                      {formatDateTime(entry.recordedAt || entry.date, locale)}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleDeleteWeightEntry(entry.id, entry.recordedAt || entry.date)}
                  style={styles.deleteWeightBtn}
                  accessibilityLabel={t.remove}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Configuração de Tema (Modo Escuro / Modo Claro) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xxl,
              marginHorizontal: spacing.lg,
              marginTop: spacing.md,
              padding: spacing.lg,
            },
          ]}
        >
          <Text style={[typography.title3, { color: colors.text, marginBottom: 12 }]}>
            {t.themeTitle}
          </Text>

          <View style={styles.themeSelectorRow}>
            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setThemeMode('dark');
              }}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: isDark ? colors.primary : colors.surfaceElevated,
                  borderColor: isDark ? colors.primary : colors.border,
                  borderRadius: radius.full,
                },
              ]}
              accessibilityRole="button"
            >
              <Ionicons
                name="moon"
                size={16}
                color={isDark ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  typography.label,
                  { color: isDark ? '#FFFFFF' : colors.text, marginLeft: 6 },
                ]}
              >
                {t.themeDark}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setThemeMode('light');
              }}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: !isDark ? colors.primary : colors.surfaceElevated,
                  borderColor: !isDark ? colors.primary : colors.border,
                  borderRadius: radius.full,
                },
              ]}
              accessibilityRole="button"
            >
              <Ionicons
                name="sunny"
                size={16}
                color={!isDark ? '#FFFFFF' : '#F59E0B'}
              />
              <Text
                style={[
                  typography.label,
                  { color: !isDark ? '#FFFFFF' : colors.text, marginLeft: 6 },
                ]}
              >
                {t.themeLight}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Configuração de Idioma */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.xxl,
              marginHorizontal: spacing.lg,
              marginTop: spacing.md,
              padding: spacing.lg,
            },
          ]}
        >
          <Text style={[typography.title3, { color: colors.text, marginBottom: 12 }]}>
            {t.profileLanguage}
          </Text>

          <View style={styles.langSelectorRow}>
            <Pressable
              onPress={() => setLocale('pt-BR')}
              style={[
                styles.langBtn,
                {
                  backgroundColor: locale === 'pt-BR' ? colors.primary : colors.surfaceElevated,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  { color: locale === 'pt-BR' ? '#FFFFFF' : colors.text },
                ]}
              >
                🇧🇷 Português (Brasil)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLocale('en')}
              style={[
                styles.langBtn,
                {
                  backgroundColor: locale === 'en' ? colors.primary : colors.surfaceElevated,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  { color: locale === 'en' ? '#FFFFFF' : colors.text },
                ]}
              >
                🇺🇸 English
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Registro Rápido de Peso */}
      <Modal
        visible={quickWeightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.xxl,
              },
            ]}
          >
            <Text style={[typography.title3, { color: colors.text, marginBottom: 6 }]}>
              {t.logWeightModalTitle}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: 10 }]}>
              {t.logWeightModalSubtitle}
            </Text>

            <View
              style={[
                styles.modalTimestampPreview,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md },
              ]}
            >
              <Ionicons name="time-outline" size={15} color={colors.primary} />
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: 6, fontSize: 12 }]}>
                {t.weightRecordedAtLabel}: {formatDateTime(new Date().toISOString(), locale)}
              </Text>
            </View>

            <TextInput
              value={quickWeightInput}
              onChangeText={setQuickWeightInput}
              keyboardType="numeric"
              autoFocus
              placeholder="74.0"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.modalInput,
                typography.title1,
                {
                  color: colors.primary,
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                },
              ]}
            />

            <View style={styles.modalButtonRow}>
              <Button
                title={t.cancel}
                variant="secondary"
                size="md"
                onPress={() => setQuickWeightModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={t.saveWeightBtn}
                size="md"
                onPress={handleSaveQuickWeight}
                style={{ flex: 1 }}
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
  scrollContent: {
    paddingTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 86,
    height: 86,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontWeight: '900',
  },
  bioBadgeBox: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    maxWidth: '92%',
  },
  levelQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    width: '100%',
  },
  levelPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  bioInput: {
    height: 76,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  editSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editSelectorOption: {
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  goalSelectorColumn: {
    gap: 8,
  },
  goalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: 6,
    height: 18,
    lineHeight: 18,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderWithToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  simulateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  simControls: {
    padding: 12,
    marginTop: 10,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
    marginTop: 14,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 18,
    fontSize: 11,
  },
  weightEntriesList: {
    marginTop: 12,
  },
  weightEntryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  weightEntryInfo: {
    flex: 1,
  },
  weightValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deleteWeightBtn: {
    padding: 6,
  },
  modalTimestampPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  langSelectorRow: {
    flexDirection: 'column',
    gap: 8,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  langBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    padding: 24,
  },
  modalInput: {
    borderWidth: 2,
    textAlign: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    fontWeight: '800',
  },
  modalButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
