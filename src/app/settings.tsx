import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Landmark, Tag } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/budget/segmented-control';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { type ThemePreference, useThemeStore } from '@/stores/theme-store';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={19} color={colors.text} strokeWidth={2.1} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <SegmentedControl value={preference} onChange={setPreference} options={THEME_OPTIONS} />
        </View>

        <Text style={styles.sectionLabel}>Manage</Text>
        <View style={styles.linkCard}>
          <Pressable style={[styles.linkRow, styles.linkRowBorder]} onPress={() => router.push('/manage-categories')}>
            <View style={styles.linkIconWrap}>
              <Tag size={17} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.linkLabel}>Categories</Text>
            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.linkRow} onPress={() => router.push('/manage-accounts')}>
            <View style={styles.linkIconWrap}>
              <Landmark size={17} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.linkLabel}>Accounts</Text>
            <ChevronRight size={18} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>
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
      padding: 14,
      marginBottom: 22,
    },
    linkCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    linkRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    linkIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
}
