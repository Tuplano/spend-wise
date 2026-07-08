import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

type ProgressBarProps = {
  progress: number; // 0-1, values above 1 clamp to a full bar
  color: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({ progress, color, trackColor, height = 10 }: ProgressBarProps) {
  const colors = useThemeColors();
  const width = `${Math.max(0, Math.min(1, progress)) * 100}%` as const;
  return (
    <View style={[styles.track, { backgroundColor: trackColor ?? colors.track, height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
