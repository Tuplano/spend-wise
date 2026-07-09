import { router } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { CategoryIcon } from '@/components/budget/category-icon';
import { DatePickerModal } from '@/components/budget/date-picker-modal';
import { SegmentedControl } from '@/components/budget/segmented-control';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { dayLabel } from '@/lib/date';
import { currencyOption } from '@/lib/money/currency';
import { BASE_CURRENCY } from '@/lib/money/exchange-rates';

const transactionSchema = z.object({
  categoryId: z.number({ error: 'Pick a category' }),
  amount: z.number().positive('Enter an amount'),
});

// Transactions are always entered/stored in BASE_CURRENCY — the display currency in Settings
// only affects how amounts are shown elsewhere, via a live conversion.
const baseCurrencySymbol = currencyOption(BASE_CURRENCY).symbol;

export default function AddTransactionScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const categories = useCategories();
  const accounts = useAccounts();
  const { isConverted, currency } = useDisplayMoney();
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [occurredAt, setOccurredAt] = useState(() => new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const visibleCategories = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);
  const selectedAccount = useMemo(() => accounts.find((a) => a.id === accountId) ?? null, [accounts, accountId]);

  function handleKindChange(next: 'expense' | 'income') {
    setKind(next);
    setCategoryId(null);
  }

  async function handleSave() {
    const amount = Math.round(parseFloat(amountText || '0') * 100);
    const parsed = transactionSchema.safeParse({ categoryId, amount });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the form and try again');
      return;
    }

    const category = categories.find((c) => c.id === parsed.data.categoryId)!;

    setSaving(true);
    try {
      await db.insert(transactions).values({
        categoryId: parsed.data.categoryId,
        accountId,
        kind,
        amount: parsed.data.amount,
        merchant: note.trim() || category.name,
        occurredAt,
      });
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
          <Text style={styles.headerTitle}>Add transaction</Text>
        </View>

        <View style={styles.segmentSpacing}>
          <SegmentedControl
            value={kind}
            onChange={handleKindChange}
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
            ]}
          />
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountSign}>{baseCurrencySymbol}</Text>
            <TextInput
              style={styles.amountInput}
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0.00"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="decimal-pad"
            />
          </View>
          {isConverted && (
            <Text style={styles.baseCurrencyHint}>
              Entered and stored in {BASE_CURRENCY}. Your {currency} display converts amounts elsewhere.
            </Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {visibleCategories.map((c) => {
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

        <View style={styles.detailCard}>
          <Pressable
            style={[styles.detailRow, styles.detailRowBorder]}
            onPress={() => setAccountPickerOpen((v) => !v)}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>{selectedAccount?.name ?? 'No account'}</Text>
          </Pressable>
          {accountPickerOpen && (
            <View style={[styles.accountPicker, styles.detailRowBorder]}>
              <Pressable
                style={styles.accountOption}
                onPress={() => {
                  setAccountId(null);
                  setAccountPickerOpen(false);
                }}>
                <Text style={styles.accountOptionText}>No account</Text>
              </Pressable>
              {accounts.map((a) => (
                <Pressable
                  key={a.id}
                  style={styles.accountOption}
                  onPress={() => {
                    setAccountId(a.id);
                    setAccountPickerOpen(false);
                  }}>
                  <View style={[styles.accountDot, { backgroundColor: a.color }]} />
                  <Text style={styles.accountOptionText}>{a.name}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.accountOption} onPress={() => router.push('/add-account')}>
                <Plus size={14} color={colors.accent} strokeWidth={2.4} />
                <Text style={[styles.accountOptionText, styles.accountOptionAdd]}>Add account</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={[styles.detailRow, styles.detailRowBorder]} onPress={() => setDatePickerOpen(true)}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{dayLabel(occurredAt)}</Text>
          </Pressable>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Note</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>Save transaction</Text>
        </Pressable>
      </ScrollView>

      <DatePickerModal
        visible={datePickerOpen}
        value={occurredAt}
        maxDate={new Date()}
        onSelect={setOccurredAt}
        onClose={() => setDatePickerOpen(false)}
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
    segmentSpacing: {
      marginBottom: 24,
    },
    amountSection: {
      alignItems: 'center',
      marginBottom: 26,
    },
    amountLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 6,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 4,
    },
    amountSign: {
      fontSize: 22,
      fontWeight: '700',
      marginTop: 8,
      color: colors.textSecondary,
    },
    baseCurrencyHint: {
      fontSize: 11.5,
      color: colors.textMuted,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 12,
    },
    amountInput: {
      fontSize: 48,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: colors.text,
      minWidth: 120,
      textAlign: 'center',
      padding: 0,
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
    detailCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      overflow: 'hidden',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    detailRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    detailLabel: {
      fontSize: 13.5,
      fontWeight: '600',
      color: colors.text,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
    accountPicker: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      gap: 2,
    },
    accountOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 8,
      paddingVertical: 10,
    },
    accountDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    accountOptionText: {
      fontSize: 13.5,
      fontWeight: '600',
      color: colors.text,
    },
    accountOptionAdd: {
      color: colors.accent,
      fontWeight: '700',
    },
    noteInput: {
      flex: 1,
      textAlign: 'right',
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
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
  });
}
