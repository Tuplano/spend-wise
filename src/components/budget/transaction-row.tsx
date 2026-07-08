import type { LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/budget/category-icon';
import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';

type TransactionRowProps = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  title: string;
  subtitle: string;
  amount: number;
  kind: 'income' | 'expense';
  onPress?: () => void;
};

export function TransactionRow({ icon, color, bgColor, title, subtitle, amount, kind, onPress }: TransactionRowProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { formatSignedCents } = useDisplayMoney();

  const content = (
    <>
      <CategoryIcon icon={icon} color={color} bgColor={bgColor} />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.amount, kind === 'income' && { color: colors.success }]}>
        {formatSignedCents(amount, kind)}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.row} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingVertical: 11,
    },
    text: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 14.5,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    amount: {
      fontSize: 14.5,
      fontWeight: '800',
      color: colors.text,
    },
  });
}
