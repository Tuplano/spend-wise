import { router } from 'expo-router';
import { Plus, Settings2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { ACCOUNT_TYPE_ICONS, type AccountTypeIconKey } from '@/constants/accounts';
import { useAccounts } from '@/hooks/use-accounts';
import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTransactions } from '@/hooks/use-transactions';

export default function AccountsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accounts = useAccounts();
  const transactions = useTransactions();
  const { formatCents } = useDisplayMoney();

  const balanceByAccount = useMemo(() => {
    const map = new Map<number, number>();
    for (const t of transactions) {
      if (t.accountId == null) continue;
      map.set(t.accountId, (map.get(t.accountId) ?? 0) + (t.kind === 'income' ? t.amount : -t.amount));
    }
    return map;
  }, [transactions]);

  const totalBalance = accounts.reduce((sum, a) => sum + (balanceByAccount.get(a.id) ?? 0), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Accounts</Text>
          <Pressable style={styles.manageButton} onPress={() => router.push('/manage-accounts')}>
            <Settings2 size={18} color={colors.text} strokeWidth={2} />
          </Pressable>
        </View>

        <Text style={styles.totalLabel}>Total across accounts</Text>
        <Text style={styles.totalValue}>{formatCents(totalBalance)}</Text>

        {accounts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No accounts yet</Text>
            <Pressable style={styles.addButton} onPress={() => router.push('/add-account')}>
              <Plus size={16} color={colors.accent} strokeWidth={2.2} />
              <Text style={styles.addButtonText}>Add account</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardRow}
              style={styles.cardScroll}>
              {accounts.map((a) => {
                const balance = balanceByAccount.get(a.id) ?? 0;
                return (
                  <View key={a.id} style={[styles.accountCard, { backgroundColor: a.color }]}>
                    <View style={styles.accountCardIcon}>
                      <CategoryIcon
                        icon={ACCOUNT_TYPE_ICONS[a.typeIcon as AccountTypeIconKey]}
                        color="#ffffff"
                        bgColor="rgba(255,255,255,0.2)"
                        size={36}
                      />
                    </View>
                    <Text style={styles.accountCardName} numberOfLines={1}>
                      {a.name}
                    </Text>
                    <Text style={styles.accountCardType}>{a.typeName}</Text>
                    <Text style={styles.accountCardBalance}>{formatCents(balance)}</Text>
                  </View>
                );
              })}
              <Pressable style={styles.addCard} onPress={() => router.push('/add-account')}>
                <Plus size={22} color={colors.accent} strokeWidth={2.2} />
                <Text style={styles.addCardText}>Add account</Text>
              </Pressable>
            </ScrollView>

            <Text style={styles.sectionLabel}>All accounts</Text>
            <View style={styles.listCard}>
              {accounts.map((a, i) => {
                const balance = balanceByAccount.get(a.id) ?? 0;
                return (
                  <View key={a.id} style={[styles.listRow, i < accounts.length - 1 && styles.listRowBorder]}>
                    <CategoryIcon
                      icon={ACCOUNT_TYPE_ICONS[a.typeIcon as AccountTypeIconKey]}
                      color={a.color}
                      bgColor={colors.track}
                      size={36}
                    />
                    <View style={styles.listText}>
                      <Text style={styles.listName}>{a.name}</Text>
                      <Text style={styles.listType}>{a.typeName}</Text>
                    </View>
                    <Text style={[styles.listBalance, balance < 0 && styles.listBalanceNegative]}>
                      {formatCents(balance)}
                    </Text>
                  </View>
                );
              })}
            </View>
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
      paddingBottom: 100,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    manageButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalLabel: {
      fontSize: 12.5,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 12,
    },
    totalValue: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
      marginBottom: 20,
    },
    cardScroll: {
      marginHorizontal: -20,
      marginBottom: 24,
    },
    cardRow: {
      paddingHorizontal: 20,
      gap: 12,
    },
    accountCard: {
      width: 168,
      borderRadius: 22,
      padding: 18,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 4,
    },
    accountCardIcon: {
      marginBottom: 22,
    },
    accountCardName: {
      fontSize: 14.5,
      fontWeight: '800',
      color: '#ffffff',
    },
    accountCardType: {
      fontSize: 11.5,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.75)',
      marginTop: 1,
      marginBottom: 14,
    },
    accountCardBalance: {
      fontSize: 18,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.3,
    },
    addCard: {
      width: 120,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addCardText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
      textAlign: 'center',
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 28,
      alignItems: 'center',
      gap: 14,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      borderStyle: 'dashed',
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 20,
    },
    addButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 10,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 13,
    },
    listRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    listText: {
      flex: 1,
    },
    listName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    listType: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginTop: 1,
    },
    listBalance: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    listBalanceNegative: {
      color: colors.danger,
    },
  });
}
