import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { ACCOUNT_TYPE_ICONS, type AccountTypeIconKey } from '@/constants/accounts';
import { db } from '@/db/client';
import { assertAccountTypeDeletable, DeleteBlockedError } from '@/db/guards';
import { accountTypes } from '@/db/schema';
import { useAccountTypes } from '@/hooks/use-account-types';
import { useThemeColors } from '@/hooks/use-theme-colors';

const ICON_KEYS = Object.keys(ACCOUNT_TYPE_ICONS) as AccountTypeIconKey[];

export default function AddAccountTypeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const accountTypeId = id ? Number(id) : null;
  const allTypes = useAccountTypes();
  const editing = useMemo(() => allTypes.find((t) => t.id === accountTypeId) ?? null, [allTypes, accountTypeId]);

  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState<AccountTypeIconKey>((editing?.icon as AccountTypeIconKey) ?? ICON_KEYS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await db.update(accountTypes).set({ name: trimmed, icon }).where(eq(accountTypes.id, editing.id));
      } else {
        const sortOrder = allTypes.reduce((max, t) => Math.max(max, t.sortOrder), 0) + 1;
        await db.insert(accountTypes).values({ name: trimmed, icon, sortOrder });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert('Delete account type?', `This removes "${editing.name}" permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await assertAccountTypeDeletable(db, editing.id, editing.name);
            await db.delete(accountTypes).where(eq(accountTypes.id, editing.id));
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
          <Text style={styles.headerTitle}>{editing ? 'Edit account type' : 'Add account type'}</Text>
        </View>

        <View style={styles.previewRow}>
          <CategoryIcon icon={ACCOUNT_TYPE_ICONS[icon]} color={colors.accent} bgColor={colors.accentSoft} size={56} />
        </View>

        <Text style={styles.sectionLabel}>Name</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Crypto wallet"
          placeholderTextColor={colors.textPlaceholder}
        />

        <Text style={styles.sectionLabel}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICON_KEYS.map((key) => {
            const selected = key === icon;
            return (
              <Pressable key={key} onPress={() => setIcon(key)}>
                <CategoryIcon
                  icon={ACCOUNT_TYPE_ICONS[key]}
                  color={selected ? colors.accent : colors.textSecondary}
                  bgColor={selected ? colors.accentSoft : colors.track}
                  size={44}
                  selected={selected}
                />
              </Pressable>
            );
          })}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{editing ? 'Save changes' : 'Add type'}</Text>
        </Pressable>

        {editing && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={15} color={colors.danger} strokeWidth={2} />
            <Text style={styles.deleteButtonText}>Delete account type</Text>
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
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
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
