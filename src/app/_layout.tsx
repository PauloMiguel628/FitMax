import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useHistoryStore } from '@/store/historyStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemedDialog } from '@/components/ui/ThemedDialog';

// Impede o splash screen de esconder antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { colors, isDark } = useAppTheme();
  const hasCompletedWelcome = useOnboardingStore((state) => state.hasCompletedWelcome);
  const recordLoginToday = useHistoryStore((state) => state.recordLoginToday);
  const [showOpeningSplash, setShowOpeningSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    recordLoginToday();
  }, [recordLoginToday]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => {
        setShowOpeningSplash(false);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const inWelcome = segments[0] === 'welcome';
    if (!hasCompletedWelcome && !inWelcome) {
      router.replace('/welcome');
    }
  }, [hasCompletedWelcome, fontsLoaded, fontError, router, segments]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="category/[bodyPart]" />
        <Stack.Screen
          name="exercise/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="exercise-timer/[id]" />
        <Stack.Screen name="workout/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="workout/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="workout/[id]/session" />
        <Stack.Screen name="workout/summary" options={{ animation: 'fade' }} />
        <Stack.Screen name="history/index" />
      </Stack>

      <ThemedDialog />

      {showOpeningSplash && (
        <LinearGradient
          colors={
            isDark
              ? ['#0D0F12', '#1A0B12', '#0D0F12']
              : ['#F8FAFC', '#FFE4EA', '#F8FAFC']
          }
          style={styles.splashContainer}
        >
          <View
            style={[
              styles.splashGlowRing,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 42, 85, 0.14)'
                  : 'rgba(225, 29, 72, 0.12)',
                borderColor: isDark
                  ? 'rgba(255, 42, 85, 0.45)'
                  : 'rgba(225, 29, 72, 0.35)',
              },
            ]}
          >
            <View
              style={[
                styles.splashIconFrame,
                { borderColor: colors.primary },
              ]}
            >
              <Image
                source={require('../../assets/images/fitmax-icon.png')}
                style={styles.splashIconImage}
                contentFit="cover"
              />
            </View>
          </View>
          <Text style={[styles.splashTitle, { color: colors.text }]}>
            FIT<Text style={{ color: colors.primary }}>MAX</Text>
          </Text>
          <Text
            style={[
              styles.splashSubtitle,
              { color: isDark ? '#94A3B8' : colors.textSecondary },
            ]}
          >
            CALISTHENICS & HOME WORKOUT
          </Text>
        </LinearGradient>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  splashGlowRing: {
    width: 156,
    height: 156,
    borderRadius: 42,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  splashIconFrame: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: '#0D0F12',
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF2A55',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  splashIconImage: {
    width: '100%',
    height: '100%',
  },
  splashTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 42,
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 6,
  },
});
