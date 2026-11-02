import { darkTheme, lightTheme, ThemeColors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { motion } from '@/theme/motion';
import { useProfileStore } from '@/store/profileStore';

export function useAppTheme() {
  const themeMode = useProfileStore((state) => state.profile.themeMode || 'dark');
  const setThemeMode = useProfileStore((state) => state.setThemeMode);
  const toggleThemeMode = useProfileStore((state) => state.toggleThemeMode);

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
