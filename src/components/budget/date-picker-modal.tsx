import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { useThemeColors } from '@/hooks/use-theme-colors';

type Props = {
  visible: boolean;
  value: Date;
  maxDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
};

function toDateString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function DatePickerModal({ visible, value, maxDate, onSelect, onClose }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selectedString = toDateString(value);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Select date</Text>
        <Calendar
          key={selectedString}
          current={selectedString}
          maxDate={maxDate ? toDateString(maxDate) : undefined}
          markedDates={{ [selectedString]: { selected: true } }}
          onDayPress={(day: DateData) => {
            onSelect(new Date(day.year, day.month - 1, day.day));
            onClose();
          }}
          enableSwipeMonths
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textPlaceholder,
            monthTextColor: colors.text,
            textMonthFontWeight: '800',
            textDayHeaderFontWeight: '700',
            arrowColor: colors.accent,
            todayTextColor: colors.accent,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: colors.textOnAccent,
          }}
          style={styles.calendar}
        />
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
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
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
      marginBottom: 8,
      textAlign: 'center',
    },
    calendar: {
      borderRadius: 16,
    },
    closeButton: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 6,
    },
    closeButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}
