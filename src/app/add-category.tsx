import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Search, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/budget/category-icon';
import { SegmentedControl } from '@/components/budget/segmented-control';
import { ColorPickerModal } from '@/components/color-picker-modal';
import { CATEGORY_COLOR_PRESETS, CATEGORY_ICONS, type CategoryIconKey } from '@/constants/categories';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { assertCategoryDeletable, DeleteBlockedError } from '@/db/guards';
import { useCategories } from '@/hooks/use-categories';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { tintWithWhite } from '@/lib/color';

const ICON_KEYS = Object.keys(CATEGORY_ICONS) as CategoryIconKey[];
const DEFAULT_ICON_COUNT = 24;

export default function AddCategoryScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const categoryId = id ? Number(id) : null;
  const allCategories = useCategories();
  const editing = useMemo(() => allCategories.find((c) => c.id === categoryId) ?? null, [allCategories, categoryId]);

  const [name, setName] = useState(editing?.name ?? '');
  const [kind, setKind] = useState<'expense' | 'income'>(editing?.kind ?? 'expense');
  const [preset, setPreset] = useState(() => {
    if (editing) return { color: editing.color, bgColor: editing.bgColor };
    return CATEGORY_COLOR_PRESETS[0];
  });
  const [icon, setIcon] = useState<CategoryIconKey>((editing?.icon as CategoryIconKey) ?? ICON_KEYS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [iconQuery, setIconQuery] = useState('');
  const searchingIcons = iconQuery.trim().length > 0;
  const filteredIconKeys = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) {
      const defaults = ICON_KEYS.slice(0, DEFAULT_ICON_COUNT);
      return defaults.includes(icon) ? defaults : [...defaults, icon];
    }
    return ICON_KEYS.filter((key) => key.replace(/-/g, ' ').includes(q));
  }, [iconQuery, icon]);

  function handleCustomColor(hex: string) {
    setPreset({ color: hex, bgColor: tintWithWhite(hex) });
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await db
          .update(categories)
          .set({ name: trimmed, kind, color: preset.color, bgColor: preset.bgColor, icon })
          .where(eq(categories.id, editing.id));
      } else {
        const sortOrder = allCategories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1;
        await db.insert(categories).values({ name: trimmed, kind, color: preset.color, bgColor: preset.bgColor, icon, sortOrder });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert('Delete category?', `This removes "${editing.name}" permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await assertCategoryDeletable(db, editing.id, editing.name);
            await db.delete(categories).where(eq(categories.id, editing.id));
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
          <Text style={styles.headerTitle}>{editing ? 'Edit category' : 'Add category'}</Text>
        </View>

        <View style={styles.previewRow}>
          <CategoryIcon icon={CATEGORY_ICONS[icon]} color={preset.color} bgColor={preset.bgColor} size={56} />
        </View>

        <Text style={styles.sectionLabel}>Name</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          placeholderTextColor={colors.textPlaceholder}
        />

        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.segmentSpacing}>
          <SegmentedControl
            value={kind}
            onChange={setKind}
            options={[
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
            ]}
          />
        </View>

        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.colorGrid}>
          {CATEGORY_COLOR_PRESETS.map((p) => {
            const selected = p.color === preset.color;
            return (
              <Pressable
                key={p.color}
                style={[styles.colorSwatch, { backgroundColor: p.color }]}
                onPress={() => setPreset(p)}>
                {selected && <Check size={16} color="#fff" strokeWidth={3} />}
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.customToggle} onPress={() => setPickerVisible(true)}>
          <View style={[styles.customToggleSwatch, { backgroundColor: preset.color }]} />
          <Text style={styles.customToggleText}>Custom color</Text>
        </Pressable>

        <ColorPickerModal
          visible={pickerVisible}
          initialColor={preset.color}
          onConfirm={handleCustomColor}
          onClose={() => setPickerVisible(false)}
        />

        <Text style={styles.sectionLabel}>Icon</Text>
        <View style={styles.iconSearch}>
          <Search size={15} color={colors.textSecondary} strokeWidth={2.2} />
          <TextInput
            style={styles.iconSearchInput}
            value={iconQuery}
            onChangeText={setIconQuery}
            placeholder="Search icons"
            placeholderTextColor={colors.textPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {iconQuery.length > 0 && (
            <Pressable onPress={() => setIconQuery('')} hitSlop={8}>
              <X size={15} color={colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          )}
        </View>

        {filteredIconKeys.length === 0 ? (
          <Text style={styles.iconEmptyText}>No icons match “{iconQuery}”</Text>
        ) : (
          <View style={styles.iconGrid}>
            {filteredIconKeys.map((key) => {
              const selected = key === icon;
              return (
                <Pressable key={key} onPress={() => setIcon(key)}>
                  <CategoryIcon
                    icon={CATEGORY_ICONS[key]}
                    color={selected ? preset.color : colors.textSecondary}
                    bgColor={selected ? preset.bgColor : colors.track}
                    size={44}
                    selected={selected}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {!searchingIcons && ICON_KEYS.length > DEFAULT_ICON_COUNT && (
          <Text style={styles.iconMoreHint}>Search for more icons</Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{editing ? 'Save changes' : 'Add category'}</Text>
        </Pressable>

        {editing && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={15} color={colors.danger} strokeWidth={2} />
            <Text style={styles.deleteButtonText}>Delete category</Text>
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
    segmentSpacing: {
      marginBottom: 24,
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
    customToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    customToggleSwatch: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    },
    customToggleText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
    },
    iconSearch: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    iconSearchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 13.5,
      fontWeight: '600',
      color: colors.text,
    },
    iconEmptyText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 24,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 10,
    },
    iconMoreHint: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
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
