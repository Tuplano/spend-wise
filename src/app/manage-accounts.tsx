import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { ACCOUNT_TYPE_ICONS, type AccountTypeIconKey } from '@/constants/accounts';
import { useAccounts } from '@/hooks/use-accounts';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ManageAccountsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accounts = useAccounts();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={19} color={colors.text} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>Accounts</Text>
        </View>

        <View style={styles.card}>
          {accounts.map((a, i) => (
            <Pressable
              key={a.id}
              style={[styles.row, i < accounts.length - 1 && styles.rowBorder]}
              onPress={() => router.push(`/add-account?id=${a.id}`)}>
              <CategoryIcon
                icon={ACCOUNT_TYPE_ICONS[a.typeIcon as AccountTypeIconKey]}
                color={a.color}
                bgColor={colors.track}
                size={34}
              />
              <Text style={styles.rowLabel}>{a.name}</Text>
              <ChevronRight size={17} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ))}
          {accounts.length === 0 && <Text style={styles.emptyText}>No accounts yet — add one to start tracking</Text>}
        </View>

        <Pressable style={styles.addButton} onPress={() => router.push('/add-account')}>
          <Plus size={16} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.addButtonText}>Add account</Text>
        </Pressable>

        <Pressable style={styles.manageTypesLink} onPress={() => router.push('/manage-account-types')}>
          <Text style={styles.manageTypesLinkText}>Manage account types</Text>
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 22,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    rowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 20,
    },
    addButton: {
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
    addButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
    manageTypesLink: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    manageTypesLinkText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });
}
