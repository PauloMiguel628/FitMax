export const palette = {
  carmine: '#E63946',
  carmineLight: '#FF4D6D',
  carmineDark: '#C1121F',
  carmineMuted: 'rgba(230, 57, 70, 0.12)',
  carmineGlow: 'rgba(230, 57, 70, 0.25)',

  // Dark palette (default for athletic look)
  darkBg: '#0D0F12',
  darkSurface: '#16191F',
  darkElevated: '#212631',
  darkBorder: 'rgba(255, 255, 255, 0.08)',
  darkBorderHighlight: 'rgba(255, 255, 255, 0.16)',
  darkText: '#FFFFFF',
  darkTextSecondary: '#94A3B8',
  darkTextMuted: '#64748B',

  // Light palette (for clean exercise list & details reference)
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightElevated: '#F1F5F9',
  lightBorder: '#E2E8F0',
  lightBorderHighlight: '#CBD5E1',
  lightText: '#0F172A',
  lightTextSecondary: '#64748B',
  lightTextMuted: '#94A3B8',

  // Status & Feedback
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.12)',
  error: '#EF4444',
  info: '#3B82F6',

  // BMI OMS Categories
  bmiUnderweight: '#38BDF8', // < 18.5
  bmiNormal: '#10B981',      // 18.5 - 24.9
  bmiOverweight: '#FBBF24',  // 25.0 - 29.9
  bmiObese1: '#FB923C',      // 30.0 - 34.9
  bmiObese2: '#F43F5E',      // 35.0 - 39.9
  bmiObese3: '#BE123C',      // >= 40.0
} as const;

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryMuted: string;
  primaryGlow: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderHighlight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  card: string;
  success: string;
  warning: string;
  error: string;
  isDark: boolean;
};

export const darkTheme: ThemeColors = {
  primary: palette.carmine,
  primaryLight: palette.carmineLight,
  primaryDark: palette.carmineDark,
  primaryMuted: palette.carmineMuted,
  primaryGlow: palette.carmineGlow,
  background: palette.darkBg,
  surface: palette.darkSurface,
  surfaceElevated: palette.darkElevated,
  border: palette.darkBorder,
  borderHighlight: palette.darkBorderHighlight,
  text: palette.darkText,
  textSecondary: palette.darkTextSecondary,
  textMuted: palette.darkTextMuted,
  card: palette.darkSurface,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  isDark: true,
};

export const lightTheme: ThemeColors = {
  primary: palette.carmine,
  primaryLight: palette.carmineLight,
  primaryDark: palette.carmineDark,
  primaryMuted: palette.carmineMuted,
  primaryGlow: palette.carmineGlow,
  background: palette.lightBg,
  surface: palette.lightSurface,
  surfaceElevated: palette.lightElevated,
  border: palette.lightBorder,
  borderHighlight: palette.lightBorderHighlight,
  text: palette.lightText,
  textSecondary: palette.lightTextSecondary,
  textMuted: palette.lightTextMuted,
  card: palette.lightSurface,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  isDark: false,
};
