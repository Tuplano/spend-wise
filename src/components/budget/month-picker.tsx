import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { monthLabel } from '@/lib/date';
import { useMonthStore } from '@/stores/month-store';

export function MonthPicker() {
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const prevMonth = useMonthStore((s) => s.prevMonth);
  const nextMonth = useMonthStore((s) => s.nextMonth);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Pressable onPress={prevMonth} hitSlop={8} style={styles.arrow}>
        <ChevronLeft size={16} color={colors.text} strokeWidth={2.2} />
      </Pressable>
      <Text style={styles.label}>{monthLabel(selectedMonthKey)}</Text>
      <Pressable onPress={nextMonth} hitSlop={8} style={styles.arrow}>
        <ChevronRight size={16} color={colors.text} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 8,
    },
    arrow: {
      paddingHorizontal: 4,
    },
    label: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 4,
      minWidth: 56,
      textAlign: 'center',
    },
  });
}
