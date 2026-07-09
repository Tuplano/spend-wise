import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { ACCOUNT_COLOR_PRESETS, ACCOUNT_TYPE_ICONS, type AccountTypeIconKey } from '@/constants/accounts';
import { db } from '@/db/client';
import { assertAccountDeletable, DeleteBlockedError } from '@/db/guards';
import { accounts } from '@/db/schema';
import { useAccounts } from '@/hooks/use-accounts';
import { useAccountTypes } from '@/hooks/use-account-types';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTransactions } from '@/hooks/use-transactions';
import { currencyOption } from '@/lib/money/currency';
import { BASE_CURRENCY } from '@/lib/money/exchange-rates';

const baseCurrencySymbol = currencyOption(BASE_CURRENCY).symbol;

export default function AddAccountScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const accountId = id ? Number(id) : null;
  const allAccounts = useAccounts();
  const accountTypes = useAccountTypes();
  const transactions = useTransactions();
  const editing = useMemo(() => allAccounts.find((a) => a.id === accountId) ?? null, [allAccounts, accountId]);

  /** Net of all transactions already logged against this account — needed to translate the
   * user-facing current balance back into the stored opening balance on save. */
  const accountNetTransactions = useMemo(() => {
    if (!editing) return 0;
    return transactions
      .filter((t) => t.accountId === editing.id)
      .reduce((sum, t) => sum + (t.kind === 'income' ? t.amount : -t.amount), 0);
  }, [transactions, editing]);

  const [name, setName] = useState(editing?.name ?? '');
  const [accountNumber, setAccountNumber] = useState(editing?.accountNumber ?? '');
  const [balanceText, setBalanceText] = useState(
    editing ? ((editing.openingBalance + accountNetTransactions) / 100).toString() : ''
  );
  const [typeId, setTypeId] = useState<number | null>(editing?.typeId ?? null);
  const [color, setColor] = useState(editing?.color ?? ACCOUNT_COLOR_PRESETS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedType = useMemo(() => accountTypes.find((t) => t.id === typeId) ?? null, [accountTypes, typeId]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name');
      return;
    }
    if (!typeId) {
      setError('Pick a type');
      return;
    }

    const trimmedNumber = accountNumber.trim() || null;
    const balanceCents = Math.round(parseFloat(balanceText || '0') * 100);
    const openingBalance = balanceCents - accountNetTransactions;

    setSaving(true);
    try {
      if (editing) {
        await db
          .update(accounts)
          .set({ name: trimmed, typeId, color, accountNumber: trimmedNumber, openingBalance })
          .where(eq(accounts.id, editing.id));
      } else {
        const sortOrder = allAccounts.reduce((max, a) => Math.max(max, a.sortOrder), 0) + 1;
        await db
          .insert(accounts)
          .values({ name: trimmed, typeId, color, accountNumber: trimmedNumber, openingBalance, sortOrder });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert('Delete account?', `This removes "${editing.name}" permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await assertAccountDeletable(db, editing.id, editing.name);
            await db.delete(accounts).where(eq(accounts.id, editing.id));
            router.back();
          } catch (e) {
            if (e instanceof DeleteBlockedError) {
              Alert.alert('Cannot delete', e.message);
            } else {
              throw e;
            }
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={19} color={colors.text} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>{editing ? 'Edit account' : 'Add account'}</Text>
        </View>

        <View style={styles.previewRow}>
          <CategoryIcon
            icon={ACCOUNT_TYPE_ICONS[(selectedType?.icon as AccountTypeIconKey) ?? 'wallet']}
            color={color}
            bgColor={colors.track}
            size={56}
          />
        </View>

        <Text style={styles.sectionLabel}>Name</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cash, BDO Savings"
          placeholderTextColor={colors.textPlaceholder}
        />

        <Text style={styles.sectionLabel}>Account number (optional)</Text>
        <TextInput
          style={styles.nameInput}
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder="e.g. last 4 digits or full number"
          placeholderTextColor={colors.textPlaceholder}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.sectionLabel}>Balance</Text>
        <View style={styles.amountInputWrap}>
          <Text style={styles.amountPrefix}>{baseCurrencySymbol}</Text>
          <TextInput
            style={styles.amountInput}
            value={balanceText}
            onChangeText={setBalanceText}
            placeholder="0.00"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.typeGrid}>
          {accountTypes.map((t) => {
            const selected = t.id === typeId;
            return (
              <Pressable
                key={t.id}
                style={[styles.typeChip, selected && { backgroundColor: colors.accentSoft, borderColor: color }]}
                onPress={() => setTypeId(t.id)}>
                <Text style={[styles.typeChipText, selected && { color, fontWeight: '800' }]}>{t.name}</Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.typeChip} onPress={() => router.push('/add-account-type')}>
            <View style={styles.typeChipAddRow}>
              <Plus size={13} color={colors.accent} strokeWidth={2.4} />
              <Text style={[styles.typeChipText, styles.typeChipAddText]}>Add type</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.colorGrid}>
          {ACCOUNT_COLOR_PRESETS.map((c) => {
            const selected = c === color;
            return (
              <Pressable key={c} style={[styles.colorSwatch, { backgroundColor: c }]} onPress={() => setColor(c)}>
                {selected && <Check size={16} color="#fff" strokeWidth={3} />}
              </Pressable>
            );
          })}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{editing ? 'Save changes' : 'Add account'}</Text>
        </Pressable>

        {editing && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={15} color={colors.danger} strokeWidth={2} />
            <Text style={styles.deleteButtonText}>Delete account</Text>
          </Pressable>
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
    previewRow: {
      alignItems: 'center',
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    nameInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 24,
    },
    amountInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 24,
    },
    amountPrefix: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      marginRight: 6,
    },
    amountInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    typeChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.surface,
    },
    typeChipText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.textMuted,
    },
    typeChipAddRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    typeChipAddText: {
      color: colors.accent,
      fontWeight: '700',
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    colorSwatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
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
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 16,
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
