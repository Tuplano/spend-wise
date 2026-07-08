import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useThemeStore } from '@/stores/theme-store';

export function useEffectiveScheme(): 'light' | 'dark' {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();
  if (preference !== 'system') return preference;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function useThemeColors() {
  const scheme = useEffectiveScheme();
  return Colors[scheme];
}
