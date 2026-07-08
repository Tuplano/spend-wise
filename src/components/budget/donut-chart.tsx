import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useThemeColors } from '@/hooks/use-theme-colors';

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerTopLabel?: string;
  centerValue?: string;
};

export function DonutChart({ data, size = 118, strokeWidth = 22, centerTopLabel, centerValue }: DonutChartProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  const dashes = data.map((segment) => (segment.value / total) * circumference);
  const offsets: number[] = [];
  for (let i = 0, running = 0; i < dashes.length; i++) {
    offsets.push(running);
    running += dashes[i];
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {data.map((segment, index) => (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashes[index]} ${circumference - dashes[index]}`}
              strokeDashoffset={-offsets[index]}
              fill="none"
            />
          ))}
        </G>
      </Svg>
      {(centerTopLabel || centerValue) && (
        <View style={[styles.center, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
          {centerTopLabel ? <Text style={styles.centerTop}>{centerTopLabel}</Text> : null}
          {centerValue ? <Text style={styles.centerValue}>{centerValue}</Text> : null}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    center: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      top: '50%',
      left: '50%',
      transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    },
    centerTop: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    centerValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '800',
    },
  });
}
