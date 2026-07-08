import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

type SegmentedControlProps<T extends string> = {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  accentColor?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, accentColor }: SegmentedControlProps<T>) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selectedColor = accentColor ?? colors.accent;

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.label, selected && { color: selectedColor, fontWeight: '800' }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.track,
      borderRadius: 14,
      padding: 4,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 11,
    },
    segmentSelected: {
      backgroundColor: colors.surface,
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 1,
    },
    label: {
      fontSize: 13.5,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}
