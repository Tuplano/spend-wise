import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { formatCents } from '@/lib/format';

type BalanceCardProps = {
  balance: number;
  income: number;
  spent: number;
};

export function BalanceCard({ balance, income, spent }: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total balance</Text>
      <Text style={styles.balance}>{formatCents(balance)}</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <TrendingUp size={13} color="#fff" strokeWidth={2.6} />
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <Text style={styles.statValue}>{formatCents(income)}</Text>
        </View>
        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <TrendingDown size={13} color="#fff" strokeWidth={2.6} />
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <Text style={styles.statValue}>{formatCents(spent)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2f6bed',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#2f6bed',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 34,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginBottom: 6,
  },
  balance: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '800',
  },
});
