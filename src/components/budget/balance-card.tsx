import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { type ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';

type BalanceCardProps = {
  label?: string;
  balance: number;
  income: number;
  spent: number;
  headerRight?: ReactNode;
};

export function BalanceCard({ label = 'Total balance', balance, income, spent, headerRight }: BalanceCardProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { formatCents } = useDisplayMoney();

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {headerRight}
      </View>
      <Text style={styles.balance}>{formatCents(balance)}</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <TrendingUp size={13} color={colors.textOnAccent} strokeWidth={2.6} />
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <Text style={styles.statValue}>{formatCents(income)}</Text>
        </View>
        <View style={styles.stat}>
          <View style={styles.statHeader}>
            <TrendingDown size={13} color={colors.textOnAccent} strokeWidth={2.6} />
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <Text style={styles.statValue}>{formatCents(spent)}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.accent,
      borderRadius: 24,
      padding: 22,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.32,
      shadowRadius: 34,
      elevation: 6,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    label: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.75)',
      fontWeight: '600',
    },
    balance: {
      fontSize: 34,
      color: colors.textOnAccent,
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
      color: colors.textOnAccent,
      fontWeight: '800',
    },
  });
}
