import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

type WeekBar = {
  label: string;
  value: number;
};

type WeeklyBarChartProps = {
  weeks: WeekBar[];
  height?: number;
};

export function WeeklyBarChart({ weeks, height = 110 }: WeeklyBarChartProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const max = Math.max(...weeks.map((w) => w.value), 1);
  const highlightIndex = weeks.reduce(
    (best, w, i) => (w.value > weeks[best].value ? i : best),
    0
  );

  return (
    <View style={[styles.row, { height }]}>
      {weeks.map((week, index) => {
        const highlighted = index === highlightIndex && week.value > 0;
        return (
          <View key={index} style={styles.column}>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max((week.value / max) * 100, 3)}%`,
                  backgroundColor: highlighted ? colors.accent : colors.accentSoft,
                },
              ]}
            />
            <Text style={[styles.label, highlighted && styles.labelHighlighted]}>{week.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    column: {
      flex: 1,
      height: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 8,
    },
    bar: {
      width: '100%',
      borderRadius: 8,
    },
    label: {
      fontSize: 10.5,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    labelHighlighted: {
      fontWeight: '800',
      color: colors.accent,
    },
  });
}
