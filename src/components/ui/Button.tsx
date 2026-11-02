import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Sizing
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 48;
  const paddingHorizontal = size === 'sm' ? spacing.md : size === 'lg' ? spacing.xxl : spacing.lg;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 17 : 15;

  // Colors based on variant
  let bgColor = colors.primary;
  let textColor = '#FFFFFF';
  let borderWidth = 0;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bgColor = colors.surfaceElevated;
    textColor = colors.text;
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    textColor = colors.primary;
    borderWidth = 1.5;
    borderColor = colors.primary;
  } else if (variant === 'danger') {
    bgColor = colors.error;
    textColor = '#FFFFFF';
  } else if (variant === 'ghost') {
    bgColor = 'transparent';
    textColor = colors.textSecondary;
  }

  if (disabled) {
    bgColor = colors.surfaceElevated;
    textColor = colors.textMuted;
    borderColor = 'transparent';
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          height,
          paddingHorizontal,
          borderRadius: radius.full,
          backgroundColor: bgColor,
          borderWidth,
          borderColor,
        },
        animatedStyle,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              typography.label,
              styles.text,
              { color: textColor, fontSize },
              icon ? { marginLeft: spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
