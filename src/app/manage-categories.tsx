import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { useCategories } from '@/hooks/use-categories';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ManageCategoriesScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const categories = useCategories();

  const expenseCategories = categories.filter((c) => c.kind === 'expense');
  const incomeCategories = categories.filter((c) => c.kind === 'income');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={19} color={colors.text} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>

        <Text style={styles.sectionLabel}>Expense</Text>
        <View style={styles.card}>
          {expenseCategories.map((c, i) => (
            <Pressable
              key={c.id}
              style={[styles.row, i < expenseCategories.length - 1 && styles.rowBorder]}
              onPress={() => router.push(`/add-category?id=${c.id}`)}>
              <CategoryIcon icon={CATEGORY_ICONS[c.icon as CategoryIconKey]} color={c.color} bgColor={c.bgColor} size={34} />
              <Text style={styles.rowLabel}>{c.name}</Text>
              <ChevronRight size={17} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ))}
          {expenseCategories.length === 0 && <Text style={styles.emptyText}>No expense categories yet</Text>}
        </View>

        <Text style={styles.sectionLabel}>Income</Text>
        <View style={styles.card}>
          {incomeCategories.map((c, i) => (
            <Pressable
              key={c.id}
              style={[styles.row, i < incomeCategories.length - 1 && styles.rowBorder]}
              onPress={() => router.push(`/add-category?id=${c.id}`)}>
              <CategoryIcon icon={CATEGORY_ICONS[c.icon as CategoryIconKey]} color={c.color} bgColor={c.bgColor} size={34} />
              <Text style={styles.rowLabel}>{c.name}</Text>
              <ChevronRight size={17} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ))}
          {incomeCategories.length === 0 && <Text style={styles.emptyText}>No income categories yet</Text>}
        </View>

        <Pressable style={styles.addButton} onPress={() => router.push('/add-category')}>
          <Plus size={16} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.addButtonText}>Add category</Text>
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
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 10,
      marginTop: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
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
