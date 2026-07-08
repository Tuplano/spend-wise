import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/components/budget/category-icon';
import { formatSignedCents } from '@/lib/format';

type TransactionRowProps = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  title: string;
  subtitle: string;
  amount: number;
  kind: 'income' | 'expense';
};

export function TransactionRow({ icon, color, bgColor, title, subtitle, amount, kind }: TransactionRowProps) {
  return (
    <View style={styles.row}>
      <CategoryIcon icon={icon} color={color} bgColor={bgColor} />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.amount, kind === 'income' && { color: '#1f9d68' }]}>
        {formatSignedCents(amount, kind)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#16233a',
  },
  subtitle: {
    fontSize: 12,
    color: '#8894ab',
    fontWeight: '500',
    marginTop: 2,
  },
  amount: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#16233a',
  },
});
