import { eq } from 'drizzle-orm';
import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { MonthPicker } from '@/components/budget/month-picker';
import { ProgressBar } from '@/components/budget/progress-bar';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { db } from '@/db/client';
import { budgets as budgetsTable } from '@/db/schema';
import { useBudgets } from '@/hooks/use-budgets';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTransactions } from '@/hooks/use-transactions';
import { monthRange } from '@/lib/date';
import { formatCents } from '@/lib/format';
import { useMonthStore } from '@/stores/month-store';

export default function BudgetsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const allBudgets = useBudgets();
  const transactions = useTransactions();
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const [editing, setEditing] = useState(false);

  const { start, end } = monthRange(selectedMonthKey);
  const monthBudgets = useMemo(
    () => allBudgets.filter((b) => b.monthKey === selectedMonthKey),
    [allBudgets, selectedMonthKey]
  );

  const spentByCategory = useMemo(() => {
    const map = new Map<number, number>();
    for (const t of transactions) {
      if (t.kind !== 'expense' || t.occurredAt < start || t.occurredAt >= end) continue;
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    }
    return map;
  }, [transactions, start, end]);

  const totalLimit = monthBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = monthBudgets.reduce((sum, b) => sum + (spentByCategory.get(b.categoryId) ?? 0), 0);
  const totalProgress = totalLimit > 0 ? totalSpent / totalLimit : 0;
  const totalLeft = totalLimit - totalSpent;

  async function updateLimit(budgetId: number, dollars: string) {
    const cents = Math.round(parseFloat(dollars || '0') * 100);
    if (!Number.isFinite(cents) || cents <= 0) return;
    await db.update(budgetsTable).set({ limitAmount: cents }).where(eq(budgetsTable.id, budgetId));
  }

  function confirmDeleteBudget(budgetId: number, categoryName: string) {
    Alert.alert('Delete budget?', `This removes the ${categoryName} budget for this month.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => db.delete(budgetsTable).where(eq(budgetsTable.id, budgetId)),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Budgets</Text>
          <MonthPicker />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total budget</Text>
          <View style={styles.totalValueRow}>
            <Text style={styles.totalValue}>{formatCents(totalLimit)}</Text>
            <Text style={styles.totalPer}>/ month</Text>
          </View>
          <ProgressBar progress={totalProgress} color={colors.accent} height={12} />
          <View style={styles.totalFooter}>
            <Text style={styles.totalSpentText}>{formatCents(totalSpent)} spent</Text>
            <Text style={[styles.totalLeftText, totalLeft < 0 && styles.overText]}>
              {formatCents(Math.abs(totalLeft))} {totalLeft < 0 ? 'over' : 'left'}
            </Text>
          </View>
        </View>

        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <Pressable onPress={() => setEditing((v) => !v)}>
            <Text style={styles.editLink}>{editing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>

        <View style={styles.categoryList}>
          {monthBudgets.map((b) => {
            const spent = spentByCategory.get(b.categoryId) ?? 0;
            const progress = b.limitAmount > 0 ? spent / b.limitAmount : 0;
            const over = spent > b.limitAmount;
            return (
              <View key={b.id}>
                <View style={styles.categoryRow}>
                  <CategoryIcon
                    icon={CATEGORY_ICONS[b.categoryIcon as CategoryIconKey]}
                    color={b.categoryColor}
                    bgColor={b.categoryBgColor}
                    size={38}
                  />
                  <View style={styles.categoryText}>
                    <Text style={styles.categoryName}>{b.categoryName}</Text>
                    <Text style={styles.categorySub}>
                      {formatCents(spent)} of {formatCents(b.limitAmount)}
                    </Text>
                  </View>
                  {editing ? (
                    <View style={styles.editControls}>
                      <TextInput
                        style={styles.editInput}
                        defaultValue={(b.limitAmount / 100).toFixed(0)}
                        keyboardType="decimal-pad"
                        onEndEditing={(e) => updateLimit(b.id, e.nativeEvent.text)}
                      />
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => confirmDeleteBudget(b.id, b.categoryName)}
                        hitSlop={8}>
                        <Trash2 size={16} color={colors.danger} strokeWidth={2} />
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={[styles.categoryStatus, over ? styles.overText : styles.underText]}>
                      {formatCents(Math.abs(b.limitAmount - spent))} {over ? 'over' : 'left'}
                    </Text>
                  )}
                </View>
                <ProgressBar progress={progress} color={over ? colors.danger : b.categoryColor} height={8} />
              </View>
            );
          })}
        </View>

        <Pressable style={styles.addBudget} onPress={() => router.push('/add-budget')}>
          <Plus size={16} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.addBudgetText}>Add budget</Text>
        </Pressable>
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
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    totalCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    totalLabel: {
      fontSize: 12.5,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    totalValueRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 16,
    },
    totalValue: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    totalPer: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 5,
    },
    totalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    totalSpentText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
    },
    totalLeftText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.accent,
    },
    overText: {
      color: colors.danger,
    },
    underText: {
      color: colors.success,
    },
    categoriesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    categoriesTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    editLink: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.accent,
    },
    categoryList: {
      gap: 16,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 9,
    },
    categoryText: {
      flex: 1,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    categorySub: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 1,
    },
    categoryStatus: {
      fontSize: 12.5,
      fontWeight: '700',
    },
    editControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editInput: {
      width: 64,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'right',
    },
    deleteButton: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.dangerSoft,
    },
    addBudget: {
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      borderStyle: 'dashed',
      borderRadius: 14,
      paddingVertical: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    addBudgetText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
  });
}
