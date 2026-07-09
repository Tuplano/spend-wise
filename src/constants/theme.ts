/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#f6f8fc',
    surface: '#ffffff',
    border: '#eaeef5',
    borderSubtle: '#f0f3f8',
    borderMuted: '#cdd6e4',
    track: '#eef1f6',

    text: '#16233a',
    textSecondary: '#8894ab',
    textMuted: '#6b7891',
    textPlaceholder: '#b3bccb',
    textOnAccent: '#ffffff',

    accent: '#92400e',
    accentSoft: '#f7ead9',
    danger: '#e5484d',
    dangerSoft: '#fbe7ea',
    success: '#2f9e6f',
    successSoft: '#e3f4ec',
    warning: '#d95a6a',

    tabInactive: '#9aa6bd',
  },
  dark: {
    background: '#0b0f16',
    surface: '#161b24',
    border: '#242b39',
    borderSubtle: '#1f2530',
    borderMuted: '#333c4d',
    track: '#232a37',

    text: '#eef1f6',
    textSecondary: '#8b96ac',
    textMuted: '#a1abc0',
    textPlaceholder: '#5b6579',
    textOnAccent: '#1c1408',

    accent: '#e0913f',
    accentSoft: '#332415',
    danger: '#ef5a5f',
    dangerSoft: '#3a1f24',
    success: '#37b57f',
    successSoft: '#173328',
    warning: '#e07480',

    tabInactive: '#5c6578',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
