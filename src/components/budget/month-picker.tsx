import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { monthLabel } from '@/lib/date';
import { useMonthStore } from '@/stores/month-store';

export function MonthPicker() {
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const prevMonth = useMonthStore((s) => s.prevMonth);
  const nextMonth = useMonthStore((s) => s.nextMonth);

  return (
    <View style={styles.container}>
      <Pressable onPress={prevMonth} hitSlop={8} style={styles.arrow}>
        <ChevronLeft size={16} color="#16233a" strokeWidth={2.2} />
      </Pressable>
      <Text style={styles.label}>{monthLabel(selectedMonthKey)}</Text>
      <Pressable onPress={nextMonth} hitSlop={8} style={styles.arrow}>
        <ChevronRight size={16} color="#16233a" strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eaeef5',
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
    color: '#16233a',
    paddingHorizontal: 4,
    minWidth: 56,
    textAlign: 'center',
  },
});
