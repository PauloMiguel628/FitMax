import { TextStyle } from 'react-native';

export const fontFamilies = {
  displayBold: 'Outfit_700Bold',
  displayExtraBold: 'Outfit_800ExtraBold',
  displayBlack: 'Outfit_900Black',
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

export const typography: Record<string, TextStyle> = {
  hero: {
    fontFamily: fontFamilies.displayBlack,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  title1: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  title2: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  title3: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerLarge: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 60,
    lineHeight: 68,
    letterSpacing: -1,
  },
  bmiNumber: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -0.5,
  },
};
