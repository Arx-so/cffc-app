/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
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

// Figma style guide palette used across app surfaces and UI Kitten theme.
export const Brand = {
  green:  '#D4FF00',
  blue:   '#40916C',
  amber:  '#F5E7A3',
  bg:     '#131517',
  surface:'#0A1F16',
  card:   '#1B4332',
  cardAlt:'#2E3836',
  graySurfaceDark: '#131716',
  border: '#455450',
  white:  '#FFFFFF',
  gray:   '#8FA39E',
  grayDark:'#5C706B',
  black:  '#131517',

  secondaryDark: '#1B4332',
  secondary:     '#40916C',
  secondaryLight:'#95D5B2',

  neutralSubtle: '#F1F2F3',
  neutralBorder: '#ABB3BA',
  neutralText:   '#5C6770',
  searchMuted:   '#C7D1CE',
  searchSurface: '#F1F3F3',

  successBg: '#CCF5A3',
  success:   '#2D5109',
  warningBg: '#F5E7A3',
  warning:   '#5C4E0A',
  errorBg:   '#F5B1A3',
  error:     '#5C180A',

  buttonPrimaryBg: '#D4FF00',
  buttonPrimaryText: '#131517',
  buttonSecondaryBg: '#5C6770',
  buttonSecondaryText: '#FFFFFF',
  inputBg: '#050706',
  inputText: '#FFFFFF',
  inputPlaceholder: '#8FA39E',
  inputBorder: '#ABB3BA',
  formInputBg: '#F1F3F3',
  formInputText: '#5C6770',
  formInputPlaceholder: '#5C6770',
  formInputBorder: '#ABB3BA',
  positionChipBg: '#2A3300',
  formControlBg: '#F1F3F3',
  formControlBorder: '#ABB3BA',
  formControlText: '#5C6770',
  formControlActiveBg: '#2E3836',
  formControlActiveBorder: '#5C706B',
  formControlActiveText: '#FFFFFF',
  detailsCardBg: '#2E3338',
  detailsCardBorder: '#65717A',
  tabBarBg: '#050706',
  tabBarActiveBg: '#D4FF00',
  tabBarText: '#131517',
  disabled: '#738C86',

  welcomeBg: '#050706',
  welcomePanel: '#394148',
  welcomePanelDark: '#101718',
  welcomeOverlay: 'rgba(0, 0, 0, 0.26)',
  welcomeGoogleBg: 'rgba(115, 130, 138, 0.82)',
  welcomeLogo: '#DFFF72',
  welcomeTitle: '#F2FFA8',
  welcomeSubtitle: '#E8FFA1',
  welcomeDot: '#73828A',
} as const;
