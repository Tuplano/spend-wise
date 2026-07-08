import { StyleSheet, View } from 'react-native';

type ProgressBarProps = {
  progress: number; // 0-1, values above 1 clamp to a full bar
  color: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({ progress, color, trackColor = '#eef1f6', height = 10 }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(1, progress)) * 100}%` as const;
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
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
