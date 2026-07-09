import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plus, Settings2, Wifi } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { ACCOUNT_TYPE_ICONS, type AccountTypeIconKey } from '@/constants/accounts';
import { useAccounts } from '@/hooks/use-accounts';
import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';

/** Darkens (negative percent) or lightens (positive) a hex color, for a card's gradient stop. */
function shade(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

/** A stable, card-number-looking 4-digit group derived from the account id. */
function pseudoDigits(id: number) {
  return String(((id * 9973) % 9000) + 1000);
}

/** The last 4 digits to show masked on the card: the real account number if set, else a stable placeholder. */
function cardDigits(a: { id: number; accountNumber: string | null }) {
  const digitsOnly = a.accountNumber?.replace(/\D/g, '') ?? '';
  return digitsOnly ? digitsOnly.slice(-4).padStart(4, '0') : pseudoDigits(a.id);
}

export default function AccountsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accounts = useAccounts();
  const { formatCents } = useDisplayMoney();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

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
                const balance = a.balance;
                const Icon = ACCOUNT_TYPE_ICONS[a.typeIcon as AccountTypeIconKey];
                return (
                  <LinearGradient
                    key={a.id}
                    colors={[shade(a.color, 12), a.color, shade(a.color, -22)]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.accountCard}>
                    <View style={styles.accountCardSheen} pointerEvents="none" />

                    <View style={styles.accountCardTopRow}>
                      <View style={styles.chip}>
                        <View style={styles.chipLine} />
                        <View style={[styles.chipLine, { width: '55%' }]} />
                      </View>
                      <Wifi size={20} color="rgba(255,255,255,0.85)" strokeWidth={2.2} style={styles.contactless} />
                    </View>

                    <Text style={styles.accountCardNumber}>
                      •••• &nbsp;•••• &nbsp;•••• &nbsp;{cardDigits(a)}
                    </Text>

                    <View style={styles.accountCardBottomRow}>
                      <View style={styles.accountCardIdentity}>
                        <Text style={styles.accountCardName} numberOfLines={1}>
                          {a.name}
                        </Text>
                        <Text style={styles.accountCardType}>{a.typeName}</Text>
                      </View>
                      <Icon size={22} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                    </View>

                    <Text style={styles.accountCardBalance}>{formatCents(balance)}</Text>
                  </LinearGradient>
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
                const balance = a.balance;
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
      width: 264,
      height: 162,
      borderRadius: 20,
      padding: 20,
      justifyContent: 'space-between',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 4,
    },
    accountCardSheen: {
      position: 'absolute',
      top: -60,
      right: -50,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    accountCardTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    chip: {
      width: 34,
      height: 25,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.35)',
      padding: 5,
      justifyContent: 'space-between',
    },
    chipLine: {
      width: '100%',
      height: 2,
      borderRadius: 1,
      backgroundColor: 'rgba(255,255,255,0.75)',
    },
    contactless: {
      transform: [{ rotate: '90deg' }],
      marginTop: 4,
    },
    accountCardNumber: {
      fontSize: 15,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.92)',
      letterSpacing: 1.5,
    },
    accountCardBottomRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    accountCardIdentity: {
      flexShrink: 1,
    },
    accountCardName: {
      fontSize: 14.5,
      fontWeight: '800',
      color: '#ffffff',
    },
    accountCardType: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.75)',
      marginTop: 1,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    accountCardBalance: {
      fontSize: 20,
      fontWeight: '800',
      color: '#ffffff',
      letterSpacing: -0.3,
    },
    addCard: {
      width: 120,
      height: 162,
      borderRadius: 20,
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
