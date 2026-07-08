import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DonutChart } from '@/components/budget/donut-chart';
import { MonthPicker } from '@/components/budget/month-picker';
import { WeeklyBarChart } from '@/components/budget/weekly-bar-chart';
import { useTransactions } from '@/hooks/use-transactions';
import { monthLabel, monthRange, shiftMonthKey, weekOfMonthIndex } from '@/lib/date';
import { formatCents, formatCompactCents } from '@/lib/format';
import { useMonthStore } from '@/stores/month-store';

export default function InsightsScreen() {
  const transactions = useTransactions();
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);

  const { start, end } = monthRange(selectedMonthKey);
  const monthExpenses = transactions.filter(
    (t) => t.kind === 'expense' && t.occurredAt >= start && t.occurredAt < end
  );
  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const prevMonthKey = shiftMonthKey(selectedMonthKey, -1);
  const prevRange = monthRange(prevMonthKey);
  const prevTotalSpent = transactions
    .filter((t) => t.kind === 'expense' && t.occurredAt >= prevRange.start && t.occurredAt < prevRange.end)
    .reduce((sum, t) => sum + t.amount, 0);

  const delta = totalSpent - prevTotalSpent;
  const pctChange = prevTotalSpent > 0 ? Math.round((Math.abs(delta) / prevTotalSpent) * 100) : 0;
  const spentLess = delta <= 0;

  const weekTotals = new Map<number, number>();
  for (const t of monthExpenses) {
    const idx = weekOfMonthIndex(t.occurredAt);
    weekTotals.set(idx, (weekTotals.get(idx) ?? 0) + t.amount);
  }
  const maxWeekIndex = Math.max(...Array.from(weekTotals.keys()), 0);
  const weeks = Array.from({ length: maxWeekIndex + 1 }, (_, i) => ({
    label: `W${i + 1}`,
    value: weekTotals.get(i) ?? 0,
  }));

  const categoryTotals = new Map<number, { label: string; color: string; value: number }>();
  for (const t of monthExpenses) {
    const existing = categoryTotals.get(t.categoryId);
    if (existing) existing.value += t.amount;
    else categoryTotals.set(t.categoryId, { label: t.categoryName, color: t.categoryColor, value: t.amount });
  }
  const categorySegments = Array.from(categoryTotals.values()).sort((a, b) => b.value - a.value);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Insights</Text>
          <MonthPicker />
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total spent this month</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalValue}>{formatCents(totalSpent)}</Text>
            {prevTotalSpent > 0 && (
              <View style={[styles.badge, { backgroundColor: spentLess ? '#e3f4ec' : '#fbe7ea' }]}>
                {spentLess ? (
                  <TrendingDown size={12} color="#1f9d68" strokeWidth={3} />
                ) : (
                  <TrendingUp size={12} color="#d95a6a" strokeWidth={3} />
                )}
                <Text style={[styles.badgeText, { color: spentLess ? '#1f9d68' : '#d95a6a' }]}>{pctChange}%</Text>
              </View>
            )}
          </View>
          {prevTotalSpent > 0 && (
            <Text style={styles.deltaText}>
              {formatCents(Math.abs(delta))} {spentLess ? 'less' : 'more'} than {monthLabel(prevMonthKey)}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly spending</Text>
          <WeeklyBarChart weeks={weeks} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>By category</Text>
          {categorySegments.length === 0 ? (
            <Text style={styles.emptyText}>No spending yet this month</Text>
          ) : (
            <View style={styles.donutRow}>
              <DonutChart
                data={categorySegments}
                centerTopLabel="Total"
                centerValue={formatCompactCents(totalSpent)}
              />
              <View style={styles.legend}>
                {categorySegments.map((s) => (
                  <View key={s.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text style={styles.legendLabel} numberOfLines={1}>
                      {s.label}
                    </Text>
                    <Text style={styles.legendValue}>{Math.round((s.value / totalSpent) * 100)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16233a',
    letterSpacing: -0.2,
  },
  totalSection: {
    gap: 3,
  },
  totalLabel: {
    fontSize: 12.5,
    color: '#8894ab',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  totalValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#16233a',
    letterSpacing: -0.4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deltaText: {
    fontSize: 12,
    color: '#8894ab',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eaeef5',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16233a',
    marginBottom: 16,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 11,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4a5566',
  },
  legendValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#16233a',
  },
  emptyText: {
    fontSize: 13,
    color: '#8894ab',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
