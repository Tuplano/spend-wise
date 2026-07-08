import { StyleSheet, Text, View } from 'react-native';

type WeekBar = {
  label: string;
  value: number;
};

type WeeklyBarChartProps = {
  weeks: WeekBar[];
  height?: number;
};

export function WeeklyBarChart({ weeks, height = 110 }: WeeklyBarChartProps) {
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
                  backgroundColor: highlighted ? '#2f6bed' : '#dbe6fb',
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

const styles = StyleSheet.create({
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
    color: '#8894ab',
  },
  labelHighlighted: {
    fontWeight: '800',
    color: '#2f6bed',
  },
});
