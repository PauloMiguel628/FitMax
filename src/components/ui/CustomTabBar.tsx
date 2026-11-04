import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
  LayoutChangeEvent,
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

const BAR_HORIZONTAL_PADDING = 15;
const CONTAINER_PADDING = 4;
const CONTAINER_BORDER_WIDTH = 1;

const TAB_CONFIG: Record<
  string,
  {
    labelPt: string;
    labelEn: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconActive: keyof typeof Ionicons.glyphMap;
    weightPt: number;
    weightEn: number;
  }
> = {
  index: {
    labelPt: 'Início',
    labelEn: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
    weightPt: 0.9,
    weightEn: 0.92,
  },
  workouts: {
    labelPt: 'Treinos',
    labelEn: 'Workouts',
    icon: 'barbell-outline',
    iconActive: 'barbell',
    weightPt: 0.96,
    weightEn: 1.06,
  },
  timer: {
    labelPt: 'Cronômetro',
    labelEn: 'Timer',
    icon: 'timer-outline',
    iconActive: 'timer',
    weightPt: 1.18,
    weightEn: 0.94,
  },
  favorites: {
    labelPt: 'Favoritos',
    labelEn: 'Favorites',
    icon: 'heart-outline',
    iconActive: 'heart',
    weightPt: 1.08,
    weightEn: 1.12,
  },
  profile: {
    labelPt: 'Perfil',
    labelEn: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
    weightPt: 0.88,
    weightEn: 0.96,
  },
};

export function CustomTabBar({ state, emitter, navigateToTab }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors, radius, typography } = useAppTheme();
  const { locale } = useTranslation();

  const [measuredWidth, setMeasuredWidth] = useState(0);

  const routes = useMemo(
    () => state.routes.filter((route) => TAB_CONFIG[route.name]),
    [state.routes]
  );
  const activeRouteKey = state.routes[state.index]?.key;
  const activeIndex = Math.max(
    0,
    routes.findIndex((r) => r.key === activeRouteKey)
  );

  const fallbackOuterWidth = Math.max(screenWidth - BAR_HORIZONTAL_PADDING * 2, 280);
  const outerBarWidth = measuredWidth > 0 ? measuredWidth : fallbackOuterWidth;
  const innerBarWidth = Math.max(
    outerBarWidth - (CONTAINER_PADDING + CONTAINER_BORDER_WIDTH) * 2,
    240
  );

  const tabMetrics = useMemo(() => {
    const weights = routes.map((route) => {
      const cfg = TAB_CONFIG[route.name];
      if (!cfg) return 1;
      return locale === 'en' ? cfg.weightEn : cfg.weightPt;
    });
    const totalWeight = weights.reduce((acc, w) => acc + w, 0) || routes.length || 5;

    const widths = weights.map((weight) => (innerBarWidth * weight) / totalWeight);
    return widths.map((width, idx) => ({
      width,
      offset: widths.slice(0, idx).reduce((sum, w) => sum + w, 0),
    }));
  }, [routes, locale, innerBarWidth]);

  const activeMetric = tabMetrics[activeIndex] ?? {
    width: innerBarWidth / (routes.length || 5),
    offset: 0,
  };

  const indicatorPosition = useSharedValue(activeMetric.offset);
  const indicatorWidth = useSharedValue(activeMetric.width);

  useEffect(() => {
    indicatorPosition.value = withSpring(activeMetric.offset, {
      damping: 20,
      stiffness: 240,
      mass: 0.8,
    });
    indicatorWidth.value = withSpring(activeMetric.width, {
      damping: 20,
      stiffness: 240,
      mass: 0.8,
    });
  }, [activeMetric.offset, activeMetric.width, indicatorPosition, indicatorWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - measuredWidth) > 0.5) {
      setMeasuredWidth(width);
    }
  };

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
        onLayout={handleContainerLayout}
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
              backgroundColor: colors.primaryMuted,
              borderColor: colors.primary,
              borderRadius: radius.full,
            },
            animatedIndicatorStyle,
          ]}
        />

        {routes.map((route: CustomTabBarRoute, index: number) => {
          const isFocused = index === activeIndex;
          const config = TAB_CONFIG[route.name] || {
            labelPt: route.name,
            labelEn: route.name,
            icon: 'ellipse-outline' as const,
            iconActive: 'ellipse' as const,
            weightPt: 1,
            weightEn: 1,
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
          const tabWidth = tabMetrics[index]?.width ?? innerBarWidth / (routes.length || 5);

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabButton,
                { width: tabWidth },
                route.name === 'profile' && styles.profileTabOpticalOffset,
              ]}
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
    paddingHorizontal: BAR_HORIZONTAL_PADDING,
    paddingTop: 6,
  },
  container: {
    flexDirection: 'row',
    height: 62,
    alignItems: 'center',
    padding: CONTAINER_PADDING,
    borderWidth: CONTAINER_BORDER_WIDTH,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  slidingIndicator: {
    position: 'absolute',
    top: CONTAINER_PADDING,
    bottom: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    borderWidth: 1.5,
  },
  tabButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  profileTabOpticalOffset: {
    paddingRight: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
