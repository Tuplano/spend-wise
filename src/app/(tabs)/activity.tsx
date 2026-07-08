import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthPicker } from '@/components/budget/month-picker';
import { TransactionRow } from '@/components/budget/transaction-row';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTransactions } from '@/hooks/use-transactions';
import { dayLabel, formatTime, monthLabel, monthRange } from '@/lib/date';
import { formatCents } from '@/lib/format';
import { useMonthStore } from '@/stores/month-store';

type Filter = 'all' | 'income' | 'expense';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

export default function ActivityScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const transactions = useTransactions();
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { start, end } = monthRange(selectedMonthKey);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.occurredAt >= start && t.occurredAt < end),
    [transactions, start, end]
  );

  const spentThisMonth = monthTransactions
    .filter((t) => t.kind === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return monthTransactions.filter((t) => {
      if (filter !== 'all' && t.kind !== filter) return false;
      if (query && !t.merchant.toLowerCase().includes(query) && !t.categoryName.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [monthTransactions, filter, search]);

  const sections = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const label = dayLabel(t.occurredAt);
      const group = groups.get(label);
      if (group) group.push(t);
      else groups.set(label, [t]);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Transactions</Text>
              <Pressable style={styles.searchButton} onPress={() => setSearchOpen((v) => !v)}>
                <Search size={19} color={colors.text} strokeWidth={2} />
              </Pressable>
            </View>

            {searchOpen && (
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions"
                placeholderTextColor={colors.textPlaceholder}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            )}

            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>Spent in {monthLabel(selectedMonthKey)}</Text>
                <Text style={styles.summaryValue}>{formatCents(spentThisMonth)}</Text>
              </View>
              <MonthPicker />
            </View>

            <View style={styles.chipsRow}>
              {FILTERS.map((f) => {
                const selected = f.value === filter;
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => setFilter(f.value)}
                    style={[styles.chip, selected && styles.chipSelected]}>
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <TransactionRow
            icon={CATEGORY_ICONS[item.categoryIcon as CategoryIconKey]}
            color={item.categoryColor}
            bgColor={item.categoryBgColor}
            title={item.merchant}
            subtitle={`${item.categoryName} · ${formatTime(item.occurredAt)}`}
            amount={item.amount}
            kind={item.kind}
            onPress={() => router.push(`/edit-transaction?id=${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found</Text>}
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
      marginBottom: 18,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    searchButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      marginBottom: 14,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 3,
    },
    summaryValue: {
      fontSize: 23,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    chipsRow: {
      flexDirection: 'row',
      gap: 9,
      marginBottom: 6,
    },
    chip: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipLabel: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.textMuted,
    },
    chipLabelSelected: {
      color: colors.textOnAccent,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 16,
      marginBottom: 2,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      paddingVertical: 20,
      textAlign: 'center',
    },
  });
}
