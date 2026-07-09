import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ColorPicker, { HueSlider, InputWidget, Panel1, Preview, Swatches } from 'reanimated-color-picker';

import { CATEGORY_COLOR_PRESETS } from '@/constants/categories';
import { useThemeColors } from '@/hooks/use-theme-colors';

const SWATCH_COLORS = CATEGORY_COLOR_PRESETS.map((p) => p.color);

type ColorPickerModalProps = {
  visible: boolean;
  initialColor: string;
  onConfirm: (hex: string) => void;
  onClose: () => void;
};

export function ColorPickerModal({ visible, initialColor, onConfirm, onClose }: ColorPickerModalProps) {
  const colors = useThemeColors();
  const [hex, setHex] = useState(initialColor);
  // The modal stays mounted (parent just toggles `visible`), so reseed `hex` whenever the
  // target color changes — useState's initial value only applies on first mount and would
  // otherwise go stale on reopen for a different category.
  const [seededColor, setSeededColor] = useState(initialColor);
  if (initialColor !== seededColor) {
    setSeededColor(initialColor);
    setHex(initialColor);
  }

  function handleConfirm() {
    onConfirm(hex);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Pick a color</Text>

          {visible && (
            // Keyed by the seed color so reopening for a different category (or "new") remounts
            // with a fresh initial value instead of carrying over the previous selection.
            <ColorPicker
              key={initialColor}
              value={initialColor}
              onChangeJS={(c) => setHex(c.hex)}
              style={styles.picker}>
              <Preview hideText style={styles.previewBar} />
              <Panel1 style={styles.panel} thumbShape="ring" />
              <HueSlider style={styles.hueSlider} thumbShape="ring" />
              <InputWidget
                defaultFormat="HEX"
                formats={['HEX']}
                inputStyle={[styles.hexInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                inputTitleStyle={{ color: colors.textSecondary }}
                iconColor={colors.textSecondary}
              />
              <Swatches colors={SWATCH_COLORS} style={styles.swatches} />
            </ColorPicker>
          )}

          <View style={styles.actions}>
            <Pressable onPress={onClose} hitSlop={8} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={[styles.confirmButton, { backgroundColor: colors.accent }]}>
              <Text style={[styles.confirmText, { color: colors.textOnAccent }]}>Use color</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  picker: {
    gap: 14,
  },
  previewBar: {
    height: 36,
    borderRadius: 12,
  },
  panel: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  hueSlider: {
    height: 28,
    borderRadius: 14,
  },
  hexInput: {
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '700',
  },
  swatches: {
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
