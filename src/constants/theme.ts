import '@/global.css';

import { Platform } from 'react-native';

// Brand color palette used across the app.
export const Brand = {
  green:  '#39FF14',
  bg:     '#0B0B0B',
  card:   '#1A1A1A',
  border: '#2A2A2A',
  white:  '#FFFFFF',
  gray:   '#777777',
  error:  '#FF4444',
} as const;

export const Colors = {
  text: Brand.white,
  background: Brand.bg,
  backgroundElement: Brand.card,
  backgroundSelected: Brand.border,
  textSecondary: Brand.gray,
  primary: Brand.green,
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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

// Brand color palette used across auth screens and the custom dark theme.
export const Brand = {
  green:  '#39FF14',
  bg:     '#0B0B0B',
  card:   '#1A1A1A',
  border: '#2A2A2A',
  white:  '#FFFFFF',
  gray:   '#777777',
  error:  '#FF4444',
} as const;
