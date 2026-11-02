import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, ThemeColors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { motion } from '@/theme/motion';
import { useProfileStore } from '@/store/profileStore';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const storedThemeMode = useProfileStore((state) => state.profile.themeMode);
  const setThemeMode = useProfileStore((state) => state.setThemeMode);
  const toggleThemeMode = useProfileStore((state) => state.toggleThemeMode);

  // RN 0.87/0.88: useColorScheme() pode retornar null; fallback padrão é 'dark' (Design Brief)
  const fallbackMode: 'dark' | 'light' = systemColorScheme === 'light' ? 'dark' : 'dark';
  const themeMode: 'dark' | 'light' = storedThemeMode ?? fallbackMode;
  const isDark = themeMode !== 'light';
  const colors: ThemeColors = isDark ? darkTheme : lightTheme;

  return {
    colors,
    isDark,
    themeMode,
    setThemeMode,
    toggleThemeMode,
    spacing,
    radius,
    typography,
    motion,
  };
}
