import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { ACCOUNT_TYPE_ICONS, type AccountTypeIconKey } from '@/constants/accounts';
import { useAccountTypes } from '@/hooks/use-account-types';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ManageAccountTypesScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accountTypes = useAccountTypes();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={19} color={colors.text} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>Account types</Text>
        </View>

        <View style={styles.card}>
          {accountTypes.map((t, i) => (
            <Pressable
              key={t.id}
              style={[styles.row, i < accountTypes.length - 1 && styles.rowBorder]}
              onPress={() => router.push(`/add-account-type?id=${t.id}`)}>
              <CategoryIcon
                icon={ACCOUNT_TYPE_ICONS[t.icon as AccountTypeIconKey]}
                color={colors.textSecondary}
                bgColor={colors.track}
                size={34}
              />
              <Text style={styles.rowLabel}>{t.name}</Text>
              <ChevronRight size={17} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ))}
          {accountTypes.length === 0 && <Text style={styles.emptyText}>No account types yet</Text>}
        </View>

        <Pressable style={styles.addButton} onPress={() => router.push('/add-account-type')}>
          <Plus size={16} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.addButtonText}>Add account type</Text>
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
  });
}
