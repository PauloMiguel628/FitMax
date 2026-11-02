import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/i18n';

export type CustomTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>
>[0];

export type CustomTabBarRoute = CustomTabBarProps['state']['routes'][number];

const TAB_CONFIG: Record<
  string,
  { labelPt: string; labelEn: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }
> = {
  index: {
    labelPt: 'Início',
    labelEn: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
  },
  workouts: {
    labelPt: 'Treinos',
    labelEn: 'Workouts',
    icon: 'barbell-outline',
    iconActive: 'barbell',
  },
  timer: {
    labelPt: 'Cronômetro',
    labelEn: 'Timer',
    icon: 'timer-outline',
    iconActive: 'timer',
  },
  favorites: {
    labelPt: 'Favoritos',
    labelEn: 'Favorites',
    icon: 'heart-outline',
    iconActive: 'heart',
  },
  profile: {
    labelPt: 'Perfil',
    labelEn: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
};

export function CustomTabBar({ state, emitter, navigateToTab }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors, radius, typography } = useAppTheme();
  const { locale } = useTranslation();

  const routes = state.routes.filter((route) => TAB_CONFIG[route.name]);
  const activeIndex = state.index;
  const numTabs = routes.length || 5;

  const barHorizontalPadding = 12;
  const totalBarWidth = screenWidth - barHorizontalPadding * 2;
  const tabWidth = (totalBarWidth - 8) / numTabs;

  const indicatorPosition = useSharedValue(activeIndex * tabWidth);

  useEffect(() => {
    indicatorPosition.value = withSpring(activeIndex * tabWidth, {
      damping: 20,
      stiffness: 240,
      mass: 0.8,
    });
  }, [activeIndex, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const bottomPadding = Math.max(insets.bottom + 6, Platform.OS === 'ios' ? 16 : 14);

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.full,
          },
        ]}
      >
        {/* Pílula Deslizante Animada */}
        <Animated.View
          style={[
            styles.slidingIndicator,
            {
              width: tabWidth,
              backgroundColor: colors.primaryMuted,
              borderColor: colors.primary,
              borderRadius: radius.full,
            },
            animatedIndicatorStyle,
          ]}
        />

        {routes.map((route: CustomTabBarRoute, index: number) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || {
            labelPt: route.name,
            labelEn: route.name,
            icon: 'ellipse-outline',
            iconActive: 'ellipse',
          };

          const onPress = () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}

            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          const tabTitle = locale === 'en' ? config.labelEn : config.labelPt;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, { width: tabWidth }]}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tabTitle}
            >
              <Ionicons
                name={isFocused ? config.iconActive : config.icon}
                size={21}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  typography.bodySmall,
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.textSecondary,
                    fontWeight: isFocused ? '800' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {tabTitle}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  container: {
    flexDirection: 'row',
    height: 62,
    alignItems: 'center',
    padding: 4,
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderWidth: 1.5,
  },
  tabButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
