import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing } = useAppTheme();
  const { t } = useTranslation();
  const setWelcomeCompleted = useOnboardingStore((state) => state.setWelcomeCompleted);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  useEffect(() => {
    textOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    textTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
    );

    buttonOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
    buttonScale.value = withDelay(
      600,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) })
    );
  }, []);

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleGetStarted = () => {
    setWelcomeCompleted(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Foto de treino em tela cheia (Homem com cordas navais / foto atlética forte) */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
        }}
        style={styles.backgroundImage}
        contentFit="cover"
        priority="high"
      />

      {/* Overlay escuro em camadas para profundidade dramática */}
      <LinearGradient
        colors={[
          'rgba(10, 12, 16, 0.35)',
          'rgba(10, 12, 16, 0.65)',
          'rgba(10, 12, 16, 0.96)',
        ]}
        locations={[0, 0.45, 0.85]}
        style={styles.gradientOverlay}
      />

      {/* Conteúdo inferior animado */}
      <View
        style={[
          styles.contentWrapper,
          {
            paddingBottom: Math.max(insets.bottom + 20, 36),
            paddingHorizontal: spacing.xxl,
          },
        ]}
      >
        <Animated.View style={[styles.textBlock, textAnimStyle]}>
          <Text
            style={[
              typography.hero,
              styles.heroText,
              { color: '#FFFFFF' },
            ]}
          >
            {t.welcomeBest}{' '}
            <Text style={{ color: colors.primary }}>{t.welcomeWorkouts}</Text>
          </Text>
          <Text
            style={[
              typography.hero,
              styles.heroText,
              { color: '#FFFFFF', marginTop: -4 },
            ]}
          >
            {t.welcomeForYou}
          </Text>

          <Text
            style={[
              typography.bodyMedium,
              styles.subtitle,
              { color: 'rgba(255, 255, 255, 0.75)', marginTop: spacing.md },
            ]}
          >
            {t.welcomeSubtitle}
          </Text>
        </Animated.View>

        {/* Botão Largo em Pílula Vermelho-Carmim: "Get Started" */}
        <Animated.View style={[styles.buttonWrapper, buttonAnimStyle]}>
          <Button
            title={t.welcomeGetStarted}
            onPress={handleGetStarted}
            size="lg"
            style={styles.getStartedButton}
            textStyle={styles.buttonText}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C10',
    position: 'relative',
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroText: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 340,
  },
  getStartedButton: {
    width: '100%',
    height: 58,
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
