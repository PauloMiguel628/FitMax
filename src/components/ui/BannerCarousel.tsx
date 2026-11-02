import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useTranslation } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_HEIGHT = 160;
const SPACING = 14;

export function BannerCarousel() {
  const { colors, radius, typography } = useAppTheme();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const banners = [
    {
      id: 'b1',
      title: t.homeBanner1Title,
      subtitle: t.homeBanner1Subtitle,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'b2',
      title: t.homeBanner2Title,
      subtitle: t.homeBanner2Subtitle,
      imageUrl: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'b3',
      title: t.homeBanner3Title,
      subtitle: t.homeBanner3Subtitle,
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (CARD_WIDTH + SPACING));
    if (index >= 0 && index < banners.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: radius.xxl,
                backgroundColor: colors.surfaceElevated,
                marginRight: SPACING,
              },
            ]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.image, { borderRadius: radius.xxl }]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['transparent', 'rgba(13, 15, 18, 0.85)']}
              style={[styles.gradient, { borderRadius: radius.xxl }]}
            />
            <View style={styles.textOverlay}>
              <Text
                style={[
                  typography.title3,
                  styles.title,
                  { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  typography.bodySmall,
                  styles.subtitle,
                  { color: 'rgba(255, 255, 255, 0.85)' },
                ]}
                numberOfLines={2}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Indicador de pontos animado */}
      <View style={styles.dotsContainer}>
        {banners.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: idx === activeIndex ? colors.primary : colors.border,
                width: idx === activeIndex ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  card: {
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  title: {
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
