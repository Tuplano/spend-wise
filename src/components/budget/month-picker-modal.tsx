import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { monthKey, parseMonthKey } from '@/lib/date';

type Props = {
  visible: boolean;
  selectedMonthKey: string;
  onSelect: (monthKey: string) => void;
  onClose: () => void;
};

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PAST_YEARS = 10;
const FUTURE_YEARS = 1;

/** Pick a year, then a month from a 12-cell grid — a direct, reliable jump instead of scrolling
 * through individual day-calendars. */
export function MonthPickerModal({ visible, selectedMonthKey, onSelect, onClose }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { year: selectedYear, month: selectedMonth } = parseMonthKey(selectedMonthKey);
  const [focusedYear, setFocusedYear] = useState(selectedYear);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear - PAST_YEARS; y <= currentYear + FUTURE_YEARS; y++) list.push(y);
    return list;
  }, [currentYear]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Jump to a month</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearRow}>
          {years.map((y) => {
            const selected = y === focusedYear;
            return (
              <Pressable
                key={y}
                style={[styles.yearChip, selected && styles.yearChipSelected]}
                onPress={() => setFocusedYear(y)}>
                <Text style={[styles.yearChipText, selected && styles.yearChipTextSelected]}>{y}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.monthGrid}>
          {MONTH_SHORT.map((label, index) => {
            const selected = focusedYear === selectedYear && index === selectedMonth;
            return (
              <Pressable
                key={label}
                style={[styles.monthCell, selected && styles.monthCellSelected]}
                onPress={() => {
                  onSelect(monthKey(new Date(focusedYear, index, 1)));
                  onClose();
                }}>
                <Text style={[styles.monthCellText, selected && styles.monthCellTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderMuted,
      alignSelf: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
      textAlign: 'center',
    },
    yearRow: {
      gap: 8,
      paddingBottom: 18,
    },
    yearChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    yearChipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    yearChipText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.textMuted,
    },
    yearChipTextSelected: {
      color: colors.textOnAccent,
    },
    monthGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    monthCell: {
      width: '30%',
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthCellSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    monthCellText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    monthCellTextSelected: {
      color: colors.textOnAccent,
    },
    closeButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 10,
    },
    closeButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}
