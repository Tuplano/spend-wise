import { router } from 'expo-router';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/budget/balance-card';
import { MonthPickerModal } from '@/components/budget/month-picker-modal';
import { ProgressBar } from '@/components/budget/progress-bar';
import { TransactionRow } from '@/components/budget/transaction-row';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { useBudgets } from '@/hooks/use-budgets';
import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTransactions } from '@/hooks/use-transactions';
import { formatTime, monthLabel, monthRange } from '@/lib/date';
import { useMonthStore } from '@/stores/month-store';
import { useProfileStore } from '@/stores/profile-store';

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
  const displayName = useProfileStore((s) => s.displayName);
  const email = useProfileStore((s) => s.email);
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const prevMonth = useMonthStore((s) => s.prevMonth);
  const nextMonth = useMonthStore((s) => s.nextMonth);
  const setMonthKey = useMonthStore((s) => s.setMonthKey);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'Y';

  const { start, end } = monthRange(selectedMonthKey);
  const thisMonthTransactions = transactions.filter((t) => t.occurredAt >= start && t.occurredAt < end);

  const monthIncome = thisMonthTransactions
    .filter((t) => t.kind === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthSpent = thisMonthTransactions
    .filter((t) => t.kind === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthNet = monthIncome - monthSpent;

  const monthBudgetLimit = budgets
    .filter((b) => b.monthKey === selectedMonthKey)
    .reduce((sum, b) => sum + b.limitAmount, 0);
  const budgetLeft = monthBudgetLimit - monthSpent;
  const budgetProgress = monthBudgetLimit > 0 ? monthSpent / monthBudgetLimit : 0;

  const recent = thisMonthTransactions.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>
              {getGreeting()} {displayName}
            </Text>
            {!!email && <Text style={styles.greetingEmail}>{email}</Text>}
          </View>
          <Pressable style={styles.avatar} onPress={() => router.push('/settings')}>
            <Text style={styles.avatarText}>{initials}</Text>
          </Pressable>
        </View>

        <View style={styles.balanceSpacing}>
          <BalanceCard
            label={`${monthLabel(selectedMonthKey)} balance`}
            balance={monthNet}
            income={monthIncome}
            spent={monthSpent}
            headerRight={
              <View style={styles.monthSwitcher}>
                <Pressable onPress={prevMonth} hitSlop={8} style={styles.monthArrow}>
                  <ChevronLeft size={14} color={colors.textOnAccent} strokeWidth={2.4} />
                </Pressable>
                <Pressable style={styles.monthSwitcherLabelButton} onPress={() => setMonthPickerOpen(true)} hitSlop={6}>
                  <CalendarDays size={12} color={colors.textOnAccent} strokeWidth={2.2} />
                  <Text style={styles.monthSwitcherLabel}>{monthLabel(selectedMonthKey)}</Text>
                </Pressable>
                <Pressable onPress={nextMonth} hitSlop={8} style={styles.monthArrow}>
                  <ChevronRight size={14} color={colors.textOnAccent} strokeWidth={2.4} />
                </Pressable>
              </View>
            }
          />
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>{monthLabel(selectedMonthKey)} budget</Text>
            <Text style={styles.budgetLeft}>{formatCents(Math.max(budgetLeft, 0))} left</Text>
          </View>
          <ProgressBar progress={budgetProgress} color={colors.accent} />
          <View style={styles.budgetFooter}>
            <Text style={styles.budgetFooterText}>{formatCents(monthSpent)} spent</Text>
            <Text style={styles.budgetFooterText}>{formatCents(monthBudgetLimit)} limit</Text>
          </View>
        </View>

        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent in {monthLabel(selectedMonthKey)}</Text>
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
          {recent.length === 0 && (
            <Text style={styles.emptyText}>No transactions in {monthLabel(selectedMonthKey)}</Text>
          )}
        </View>
      </ScrollView>

      <MonthPickerModal
        visible={monthPickerOpen}
        selectedMonthKey={selectedMonthKey}
        onSelect={setMonthKey}
        onClose={() => setMonthPickerOpen(false)}
      />
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
      justifyContent: 'space-between',
      marginBottom: 22,
    },
    greetingBlock: {
      flex: 1,
      gap: 2,
    },
    greeting: {
      fontSize: 20,
      color: colors.text,
      fontWeight: '800',
    },
    greetingEmail: {
      fontSize: 12.5,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.textOnAccent,
    },
    balanceSpacing: {
      marginBottom: 18,
    },
    monthSwitcher: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    monthArrow: {
      paddingHorizontal: 4,
    },
    monthSwitcherLabelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 4,
    },
    monthSwitcherLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textOnAccent,
      minWidth: 36,
      textAlign: 'center',
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
