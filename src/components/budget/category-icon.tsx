import type { LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

type CategoryIconProps = {
  icon: LucideIcon;
  color: string;
  bgColor?: string;
  size?: number;
  iconSize?: number;
  selected?: boolean;
};

export function CategoryIcon({ icon: Icon, color, size = 42, iconSize, selected }: CategoryIconProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          borderWidth: selected ? 1.5 : 1,
          borderColor: selected ? color : colors.border,
        },
      ]}>
      <Icon size={iconSize ?? size * 0.46} color={color} strokeWidth={1.8} />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    bubble: {
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: colors.surface,
    },
  });
}
