import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CategoryCardProps {
  id: string;
  name: string;
  coverUrl: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryCard({ id, name, coverUrl, onPress }: CategoryCardProps) {
  const { colors, radius, typography } = useAppTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          borderRadius: radius.xxl,
          backgroundColor: colors.surfaceElevated,
        },
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <Image
        source={{ uri: coverUrl }}
        style={[styles.image, { borderRadius: radius.xxl }]}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['transparent', 'rgba(10, 12, 16, 0.4)', 'rgba(10, 12, 16, 0.95)']}
        locations={[0.3, 0.65, 1]}
        style={[styles.gradient, { borderRadius: radius.xxl }]}
      />
      <View style={styles.labelContainer}>
        <Text
          style={[
            typography.title3,
            styles.nameText,
            { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 6 },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 140,
    margin: 6,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  labelContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  nameText: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
