import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MonthPickerModal } from '@/components/budget/month-picker-modal';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { monthLabel } from '@/lib/date';
import { useMonthStore } from '@/stores/month-store';

export function MonthPicker() {
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const prevMonth = useMonthStore((s) => s.prevMonth);
  const nextMonth = useMonthStore((s) => s.nextMonth);
  const setMonthKey = useMonthStore((s) => s.setMonthKey);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable onPress={prevMonth} hitSlop={8} style={styles.arrow}>
        <ChevronLeft size={16} color={colors.text} strokeWidth={2.2} />
      </Pressable>
      <Pressable style={styles.labelButton} onPress={() => setPickerOpen(true)} hitSlop={6}>
        <CalendarDays size={13} color={colors.textSecondary} strokeWidth={2.2} />
        <Text style={styles.label}>{monthLabel(selectedMonthKey)}</Text>
      </Pressable>
      <Pressable onPress={nextMonth} hitSlop={8} style={styles.arrow}>
        <ChevronRight size={16} color={colors.text} strokeWidth={2.2} />
      </Pressable>

      <MonthPickerModal
        visible={pickerOpen}
        selectedMonthKey={selectedMonthKey}
        onSelect={setMonthKey}
        onClose={() => setPickerOpen(false)}
      />
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
    labelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 4,
    },
    label: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
      minWidth: 44,
      textAlign: 'center',
    },
  });
}
