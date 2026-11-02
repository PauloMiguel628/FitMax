import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProfileStore } from '@/store/profileStore';
import { useTranslation } from '@/i18n';

interface HeaderProps {
  onPressBell?: () => void;
}

export function Header({ onPressBell }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleThemeMode, spacing, radius, typography } = useAppTheme();
  const { t } = useTranslation();
  const profile = useProfileStore((state) => state.profile);

  const handleAvatarPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/(tabs)/profile');
  };

  const handleBellPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onPressBell) {
      onPressBell();
    }
  };

  const handleToggleTheme = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    toggleThemeMode();
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg, paddingTop: Math.max(insets.top + 6, 16) }]}>
      <View style={styles.textContainer}>
        <Text
          style={[
            typography.hero,
            styles.readyToText,
            { color: colors.text, fontSize: 32, lineHeight: 36 },
          ]}
        >
          {t.homeReadyTo}
        </Text>
        <Text
          style={[
            typography.hero,
            styles.workoutText,
            { color: colors.primary, fontSize: 32, lineHeight: 36 },
          ]}
        >
          {t.homeWorkout}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <Pressable
          onPress={handleAvatarPress}
          style={({ pressed }) => [
            styles.avatarPressable,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t.profileTitle}
        >
          {profile.photoUri ? (
            <Image
              source={{ uri: profile.photoUri }}
              style={[
                styles.avatarImage,
                { borderColor: colors.border, borderRadius: radius.full },
              ]}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Ionicons name="person" size={20} color={colors.textSecondary} />
            </View>
          )}
        </Pressable>

        <View style={styles.subActionsRow}>
          <Pressable
            onPress={handleToggleTheme}
            style={({ pressed }) => [
              styles.bellButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.full,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.themeTitle}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={19}
              color={isDark ? '#FBBF24' : colors.primary}
            />
          </Pressable>

          <Pressable
            onPress={handleBellPress}
            style={({ pressed }) => [
              styles.bellButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.full,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t.weeklyTitle}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View
              style={[
                styles.bellBadge,
                { backgroundColor: colors.primary, borderColor: colors.background },
              ]}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  readyToText: {
    fontWeight: '900',
  },
  workoutText: {
    fontWeight: '900',
  },
  actionsContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  subActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPressable: {
    width: 44,
    height: 44,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
