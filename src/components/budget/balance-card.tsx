import { type ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useDisplayMoney } from '@/hooks/use-display-money';
import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { withAlpha } from '@/lib/color';

type BalanceCardProps = {
  label?: string;
  balance: number;
  income?: number;
  spent?: number;
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
      {income !== undefined && spent !== undefined && (
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCents(income)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>{formatCents(spent)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      padding: Spacing.three,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.half,
    },
    label: {
      fontSize: 13,
      color: withAlpha(colors.textOnAccent, 0.72),
      fontWeight: '600',
    },
    balance: {
      fontSize: 32,
      color: colors.textOnAccent,
      fontWeight: '700',
      letterSpacing: -0.5,
      fontVariant: ['tabular-nums'],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.three,
      paddingTop: Spacing.two,
      borderTopWidth: 1,
      borderTopColor: withAlpha(colors.textOnAccent, 0.18),
    },
    stat: {
      flex: 1,
      gap: 2,
    },
    statDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: withAlpha(colors.textOnAccent, 0.18),
      marginHorizontal: Spacing.two,
    },
    statLabel: {
      fontSize: 11.5,
      color: withAlpha(colors.textOnAccent, 0.72),
      fontWeight: '600',
    },
    statValue: {
      fontSize: 15,
      color: colors.textOnAccent,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
  });
}
