import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/budget/balance-card';
import { ProgressBar } from '@/components/budget/progress-bar';
import { TransactionRow } from '@/components/budget/transaction-row';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { useBudgets } from '@/hooks/use-budgets';
import { useTransactions } from '@/hooks/use-transactions';
import { formatTime, monthKey, monthLabel, monthRange } from '@/lib/date';
import { formatCents } from '@/lib/format';

const DEMO_USER_NAME = 'Alex Kim';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export default function DashboardScreen() {
  const transactions = useTransactions();
  const budgets = useBudgets();

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
  const initials = DEMO_USER_NAME.split(' ')
    .map((w) => w[0])
    .join('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{DEMO_USER_NAME}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <View style={styles.balanceSpacing}>
          <BalanceCard balance={balance} income={monthIncome} spent={monthSpent} />
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>{monthLabel(currentMonthKey)} budget</Text>
            <Text style={styles.budgetLeft}>{formatCents(Math.max(budgetLeft, 0))} left</Text>
          </View>
          <ProgressBar progress={budgetProgress} color="#2f6bed" />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f8fc',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  greeting: {
    fontSize: 13,
    color: '#8894ab',
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    color: '#16233a',
    fontWeight: '800',
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8effe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2f6bed',
  },
  balanceSpacing: {
    marginBottom: 18,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eaeef5',
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
    color: '#16233a',
  },
  budgetLeft: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2f6bed',
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  budgetFooterText: {
    fontSize: 12,
    color: '#8894ab',
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
    color: '#16233a',
  },
  seeAll: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2f6bed',
  },
  emptyText: {
    fontSize: 13,
    color: '#8894ab',
    paddingVertical: 20,
    textAlign: 'center',
  },
});
