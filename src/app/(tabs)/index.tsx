import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/budget/balance-card';
import { ProgressBar } from '@/components/budget/progress-bar';
import { TransactionRow } from '@/components/budget/transaction-row';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { useBudgets } from '@/hooks/use-budgets';
import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTransactions } from '@/hooks/use-transactions';
import { formatTime, monthKey, monthLabel, monthRange } from '@/lib/date';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export default function DashboardScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const transactions = useTransactions();
  const budgets = useBudgets();
  const { formatCents } = useDisplayMoney();

  const currentMonthKey = monthKey(new Date());
  const { start, end } = monthRange(currentMonthKey);
  const thisMonthTransactions = transactions.filter((t) => t.occurredAt >= start && t.occurredAt < end);

  const balance = transactions.reduce((sum, t) => sum + (t.kind === 'income' ? t.amount : -t.amount), 0);
  const monthIncome = thisMonthTransactions
    .filter((t) => t.kind === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthSpent = thisMonthTransactions
    .filter((t) => t.kind === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthBudgetLimit = budgets
    .filter((b) => b.monthKey === currentMonthKey)
    .reduce((sum, b) => sum + b.limitAmount, 0);
  const budgetLeft = monthBudgetLimit - monthSpent;
  const budgetProgress = monthBudgetLimit > 0 ? monthSpent / monthBudgetLimit : 0;

  const recent = transactions.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
        </View>

        <View style={styles.balanceSpacing}>
          <BalanceCard balance={balance} income={monthIncome} spent={monthSpent} />
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>{monthLabel(currentMonthKey)} budget</Text>
            <Text style={styles.budgetLeft}>{formatCents(Math.max(budgetLeft, 0))} left</Text>
          </View>
          <ProgressBar progress={budgetProgress} color={colors.accent} />
          <View style={styles.budgetFooter}>
            <Text style={styles.budgetFooterText}>{formatCents(monthSpent)} spent</Text>
            <Text style={styles.budgetFooterText}>{formatCents(monthBudgetLimit)} limit</Text>
          </View>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent</Text>
          <Pressable onPress={() => router.push('/activity')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <View>
          {recent.map((t) => (
            <TransactionRow
              key={t.id}
              icon={CATEGORY_ICONS[t.categoryIcon as CategoryIconKey]}
              color={t.categoryColor}
              bgColor={t.categoryBgColor}
              title={t.merchant}
              subtitle={`${t.categoryName} · ${formatTime(t.occurredAt)}`}
              amount={t.amount}
              kind={t.kind}
            />
          ))}
          {recent.length === 0 && <Text style={styles.emptyText}>No transactions yet</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 100,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 22,
    },
    greeting: {
      fontSize: 20,
      color: colors.text,
      fontWeight: '800',
    },
    balanceSpacing: {
      marginBottom: 18,
    },
    budgetCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 22,
    },
    budgetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    budgetTitle: {
      fontSize: 14.5,
      fontWeight: '700',
      color: colors.text,
    },
    budgetLeft: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
    budgetFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    budgetFooterText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    recentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    recentTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    seeAll: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.accent,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      paddingVertical: 20,
      textAlign: 'center',
    },
  });
}
