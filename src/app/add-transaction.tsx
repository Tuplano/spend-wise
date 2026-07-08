import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { CategoryIcon } from '@/components/budget/category-icon';
import { SegmentedControl } from '@/components/budget/segmented-control';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { db } from '@/db/client';
import { transactions } from '@/db/schema';
import { useCategories } from '@/hooks/use-categories';

const transactionSchema = z.object({
  categoryId: z.number({ error: 'Pick a category' }),
  amount: z.number().positive('Enter an amount'),
});

export default function AddTransactionScreen() {
  const categories = useCategories();
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isYesterday, setIsYesterday] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const visibleCategories = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

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
    const occurredAt = new Date();
    if (isYesterday) occurredAt.setDate(occurredAt.getDate() - 1);

    setSaving(true);
    try {
      await db.insert(transactions).values({
        categoryId: parsed.data.categoryId,
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
            <ChevronLeft size={19} color="#16233a" strokeWidth={2.1} />
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
            <Text style={styles.amountSign}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0.00"
              placeholderTextColor="#c2cad8"
              keyboardType="decimal-pad"
            />
          </View>
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
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>Card •• 4821</Text>
          </View>
          <Pressable style={[styles.detailRow, styles.detailRowBorder]} onPress={() => setIsYesterday((v) => !v)}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{isYesterday ? 'Yesterday' : 'Today'}</Text>
          </Pressable>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Note</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
              placeholderTextColor="#b3bccb"
            />
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>Save transaction</Text>
        </Pressable>
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eaeef5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16233a',
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
    color: '#8894ab',
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
    color: '#8894ab',
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#16233a',
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16233a',
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
    color: '#6b7891',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eaeef5',
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
    borderBottomColor: '#f0f3f8',
  },
  detailLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#16233a',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7891',
  },
  noteInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: '#16233a',
  },
  errorText: {
    color: '#e5484d',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2f6bed',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2f6bed',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
