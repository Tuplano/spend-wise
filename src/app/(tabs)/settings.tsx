import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import {
  Banknote,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Contrast,
  Download,
  Info,
  Landmark,
  Tag,
  UploadCloud,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDisplayMoney } from '@/hooks/use-display-money';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { exportBackup, importBackup, validateBackup } from '@/lib/device/backup';
import { CURRENCY_OPTIONS } from '@/lib/money/currency';
import { BASE_CURRENCY } from '@/lib/money/exchange-rates';
import { useCurrencyStore } from '@/stores/currency-store';
import { useProfileStore } from '@/stores/profile-store';
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
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const { isConverted, isLive, rate, fetchedAt } = useDisplayMoney();
  const displayName = useProfileStore((s) => s.displayName);
  const email = useProfileStore((s) => s.email);
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const setEmail = useProfileStore((s) => s.setEmail);

  const [expandedPicker, setExpandedPicker] = useState<'theme' | 'currency' | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'email' | null>(null);
  const [draft, setDraft] = useState('');
  const [dataBusy, setDataBusy] = useState(false);

  const themeLabel = THEME_OPTIONS.find((o) => o.value === preference)?.label ?? 'System';

  function startEditing(field: 'name' | 'email') {
    setEditingField(field);
    setDraft(field === 'name' ? displayName : email);
  }

  function commitEditing() {
    if (!editingField) return;
    const value = draft.trim();
    if (editingField === 'name') setDisplayName(value || 'You');
    else setEmail(value);
    setEditingField(null);
  }

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'Y';

  async function handleExportBackup() {
    if (dataBusy) return;
    setDataBusy(true);
    try {
      await exportBackup();
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setDataBusy(false);
    }
  }

  async function handleImportBackup() {
    if (dataBusy) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    setDataBusy(true);
    try {
      const raw = JSON.parse(await new File(result.assets[0].uri).text());
      const validation = validateBackup(raw);
      if (!validation.ok) {
        Alert.alert('Invalid backup', validation.error);
        return;
      }

      Alert.alert(
        'Replace all data?',
        "Importing will delete your current accounts, transactions, budgets, and categories, and replace them with this backup. This can't be undone.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                await importBackup(validation.data);
                Alert.alert('Import complete', 'Your data has been restored from the backup.');
              } catch (error) {
                Alert.alert('Import failed', error instanceof Error ? error.message : 'Something went wrong.');
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert('Invalid backup', 'Could not read that file as a backup.');
    } finally {
      setDataBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileFields}>
            {editingField === 'name' ? (
              <TextInput
                value={draft}
                onChangeText={setDraft}
                autoFocus
                placeholder="Your name"
                placeholderTextColor={colors.textPlaceholder}
                onSubmitEditing={commitEditing}
                onBlur={commitEditing}
                style={styles.profileNameInput}
              />
            ) : (
              <Pressable onPress={() => startEditing('name')}>
                <Text style={styles.profileName}>{displayName}</Text>
              </Pressable>
            )}
            {editingField === 'email' ? (
              <TextInput
                value={draft}
                onChangeText={setDraft}
                autoFocus
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textPlaceholder}
                onSubmitEditing={commitEditing}
                onBlur={commitEditing}
                style={styles.profileEmailInput}
              />
            ) : (
              <Pressable onPress={() => startEditing('email')}>
                <Text style={styles.profileEmail}>{email || 'Add email'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.group}>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => setExpandedPicker(expandedPicker === 'currency' ? null : 'currency')}>
            <View style={[styles.row, styles.rowBorder]}>
              <IconBadge icon={Banknote} tint={colors.accent} bg={colors.accentSoft} />
              <Text style={styles.rowLabel}>Currency</Text>
              <Text style={styles.rowValue}>{currency}</Text>
              {expandedPicker === 'currency' ? (
                <ChevronUp size={16} color={colors.textMuted} strokeWidth={2.2} />
              ) : (
                <ChevronDown size={16} color={colors.textMuted} strokeWidth={2.2} />
              )}
            </View>
          </Pressable>
          {isConverted && (
            <View style={[styles.currencyHintRow, styles.rowBorder]}>
              <Text style={styles.currencyHintText}>
                {isLive
                  ? `Live-converted from ${BASE_CURRENCY} · 1 ${BASE_CURRENCY} ≈ ${rate.toFixed(4)} ${currency}${
                      fetchedAt ? ` · updated ${new Date(fetchedAt).toLocaleDateString()}` : ''
                    }`
                  : `Rate unavailable — showing ${BASE_CURRENCY} until a connection is available`}
              </Text>
            </View>
          )}
          {expandedPicker === 'currency' && (
            <View style={[styles.optionRow, styles.rowBorder]}>
              {CURRENCY_OPTIONS.map((option) => {
                const selected = option.code === currency;
                return (
                  <Pressable
                    key={option.code}
                    style={({ pressed }) => pressed && styles.pressed}
                    onPress={() => {
                      setCurrency(option.code);
                      setExpandedPicker(null);
                    }}>
                    <View style={[styles.optionChip, selected && { backgroundColor: colors.accent }]}>
                      <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                        {option.code}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => setExpandedPicker(expandedPicker === 'theme' ? null : 'theme')}>
            <View style={[styles.row, expandedPicker === 'theme' ? styles.rowBorder : styles.rowNoBorder]}>
              <IconBadge icon={Contrast} tint={colors.accent} bg={colors.accentSoft} />
              <Text style={styles.rowLabel}>Theme</Text>
              <Text style={styles.rowValue}>{themeLabel}</Text>
              {expandedPicker === 'theme' ? (
                <ChevronUp size={16} color={colors.textMuted} strokeWidth={2.2} />
              ) : (
                <ChevronDown size={16} color={colors.textMuted} strokeWidth={2.2} />
              )}
            </View>
          </Pressable>
          {expandedPicker === 'theme' && (
            <View style={styles.optionRow}>
              {THEME_OPTIONS.map((option) => {
                const selected = option.value === preference;
                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => pressed && styles.pressed}
                    onPress={() => {
                      setPreference(option.value);
                      setExpandedPicker(null);
                    }}>
                    <View style={[styles.optionChip, selected && { backgroundColor: colors.accent }]}>
                      <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                        {option.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>Manage</Text>
        <View style={styles.group}>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => router.push('/manage-categories')}>
            <View style={[styles.row, styles.rowBorder]}>
              <IconBadge icon={Tag} tint={colors.accent} bg={colors.accentSoft} />
              <Text style={styles.rowLabel}>Categories</Text>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2.2} />
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => router.push('/manage-accounts')}>
            <View style={[styles.row, styles.rowNoBorder]}>
              <IconBadge icon={Landmark} tint={colors.accent} bg={colors.accentSoft} />
              <Text style={styles.rowLabel}>Accounts</Text>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2.2} />
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.group}>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={handleExportBackup}
            disabled={dataBusy}>
            <View style={[styles.row, styles.rowBorder]}>
              <IconBadge icon={UploadCloud} tint={colors.accent} bg={colors.accentSoft} />
              <Text style={styles.rowLabel}>Export backup</Text>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2.2} />
            </View>
          </Pressable>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={handleImportBackup}
            disabled={dataBusy}>
            <View style={[styles.row, styles.rowNoBorder]}>
              <IconBadge icon={Download} tint={colors.danger} bg={colors.dangerSoft} />
              <Text style={styles.rowLabel}>Import backup</Text>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2.2} />
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.group}>
          <View style={[styles.row, styles.rowNoBorder]}>
            <IconBadge icon={Info} tint={colors.textSecondary} bg={colors.track} />
            <Text style={styles.rowLabel}>About Spend Wise</Text>
            <Text style={styles.rowValue}>v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconBadge({
  icon: Icon,
  tint,
  bg,
}: {
  icon: typeof Tag;
  tint: string;
  bg: string;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.iconBadge, { backgroundColor: bg }]}>
      <Icon size={16} color={tint} strokeWidth={2.2} />
    </View>
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
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 22,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textOnAccent,
    },
    profileFields: {
      flex: 1,
      gap: 2,
    },
    profileName: {
      fontSize: 15.5,
      fontWeight: '800',
      color: colors.text,
    },
    profileNameInput: {
      fontSize: 15.5,
      fontWeight: '800',
      color: colors.text,
      padding: 0,
    },
    profileEmail: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    profileEmailInput: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      padding: 0,
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
    group: {
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
      paddingVertical: 14,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    rowNoBorder: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    rowValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      marginRight: 4,
    },
    currencyHintRow: {
      paddingHorizontal: 16,
      paddingBottom: 13,
    },
    currencyHintText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: colors.textMuted,
    },
    optionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    optionChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.background,
    },
    optionChipText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
    },
    optionChipTextSelected: {
      color: colors.textOnAccent,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.6,
    },
  });
}
