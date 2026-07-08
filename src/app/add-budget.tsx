import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { db } from '@/db/client';
import { budgets } from '@/db/schema';
import { useBudgets } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useMonthStore } from '@/stores/month-store';

export default function AddBudgetScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const categories = useCategories();
  const allBudgets = useBudgets();
  const selectedMonthKey = useMonthStore((s) => s.selectedMonthKey);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [limitText, setLimitText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const availableCategories = useMemo(() => {
    const budgeted = new Set(
      allBudgets.filter((b) => b.monthKey === selectedMonthKey).map((b) => b.categoryId)
    );
    return categories.filter((c) => c.kind === 'expense' && !budgeted.has(c.id));
  }, [categories, allBudgets, selectedMonthKey]);

  async function handleSave() {
    const limitAmount = Math.round(parseFloat(limitText || '0') * 100);
    if (!categoryId) {
      setError('Pick a category');
      return;
    }
    if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
      setError('Enter a monthly limit');
      return;
    }

    setSaving(true);
    try {
      await db.insert(budgets).values({ categoryId, monthKey: selectedMonthKey, limitAmount });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={19} color={colors.text} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>Add budget</Text>
        </View>

        {availableCategories.length === 0 ? (
          <Text style={styles.emptyText}>Every category already has a budget this month.</Text>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {availableCategories.map((c) => {
                const selected = c.id === categoryId;
                return (
                  <Pressable key={c.id} style={styles.categoryItem} onPress={() => setCategoryId(c.id)}>
                    <CategoryIcon
                      icon={CATEGORY_ICONS[c.icon as CategoryIconKey]}
                      color={c.color}
                      bgColor={c.bgColor}
                      size={52}
                      selected={selected}
                    />
                    <Text style={[styles.categoryLabel, selected && { color: c.color, fontWeight: '800' }]}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Monthly limit</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountSign}>₱</Text>
              <TextInput
                style={styles.amountInput}
                value={limitText}
                onChangeText={setLimitText}
                placeholder="0"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="decimal-pad"
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveButtonText}>Save budget</Text>
            </Pressable>
          </>
        )}
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
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 24,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    categoryItem: {
      width: '21%',
      alignItems: 'center',
      gap: 6,
    },
    categoryLabel: {
      fontSize: 10.5,
      fontWeight: '600',
      color: colors.textMuted,
      textAlign: 'center',
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 4,
      marginBottom: 24,
    },
    amountSign: {
      fontSize: 22,
      fontWeight: '700',
      marginTop: 8,
      color: colors.textSecondary,
    },
    amountInput: {
      fontSize: 40,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: colors.text,
      minWidth: 100,
      textAlign: 'center',
      padding: 0,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      textAlign: 'center',
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 6,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.textOnAccent,
      fontSize: 15,
      fontWeight: '800',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 40,
    },
  });
}
