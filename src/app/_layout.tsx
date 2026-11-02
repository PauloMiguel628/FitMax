import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
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
        barStyle={showOpeningSplash || isDark ? 'light-content' : 'dark-content'}
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

      {showOpeningSplash && (
        <LinearGradient
          colors={['#0D0F12', '#1A0B12', '#0D0F12']}
          style={styles.splashContainer}
        >
          <View style={styles.splashGlowRing}>
            <View style={styles.splashIconCircle}>
              <Ionicons name="barbell" size={54} color="#FF2A55" />
              <View style={styles.splashFlameBadge}>
                <Ionicons name="flame" size={20} color="#FFFFFF" />
              </View>
            </View>
          </View>
          <Text style={styles.splashTitle}>
            FIT<Text style={{ color: '#FF2A55' }}>MAX</Text>
          </Text>
          <Text style={styles.splashSubtitle}>
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
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(255, 42, 85, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 42, 85, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  splashIconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#161920',
    borderWidth: 2,
    borderColor: '#FF2A55',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  splashFlameBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF2A55',
    borderWidth: 3,
    borderColor: '#0D0F12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 42,
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  splashSubtitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    letterSpacing: 3,
    color: '#94A3B8',
    marginTop: 6,
  },
});
