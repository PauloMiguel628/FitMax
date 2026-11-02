import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'fitness-outline',
  title,
  subtitle,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useAppTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.primaryMuted,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <Ionicons name={icon} size={42} color={colors.primary} />
      </View>
      <Text
        style={[
          typography.title3,
          styles.title,
          { color: colors.text, marginBottom: spacing.xs },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          typography.bodyMedium,
          styles.subtitle,
          { color: colors.textSecondary, marginBottom: spacing.xl },
        ]}
      >
        {subtitle}
      </Text>
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} size="md" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
