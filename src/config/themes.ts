import * as eva from '@eva-design/eva';
import { ThemeType } from '@ui-kitten/components';

// Light theme colors - sport green palette
const lightThemeColors = {
  'color-primary-100': '#F7FFE0',
  'color-primary-200': '#ECFFA3',
  'color-primary-300': '#E4FF66',
  'color-primary-400': '#DCFF33',
  'color-primary-500': '#D4FF00',
  'color-primary-600': '#AACC00',
  'color-primary-700': '#7F9900',
  'color-primary-800': '#556600',
  'color-primary-900': '#2A3300',
  'color-primary-transparent-100': 'rgba(212, 255, 0, 0.08)',
  'color-primary-transparent-200': 'rgba(212, 255, 0, 0.16)',
  'color-primary-transparent-300': 'rgba(212, 255, 0, 0.24)',
  'color-primary-transparent-400': 'rgba(212, 255, 0, 0.32)',
  'color-primary-transparent-500': 'rgba(212, 255, 0, 0.40)',
  'color-primary-transparent-600': 'rgba(212, 255, 0, 0.48)',

  'color-basic-100': '#ffffff', // Card
  'color-basic-200': '#fdfdfd', // Background
  'color-basic-300': '#f5f5f5', // Secondary
  'color-basic-400': '#f0f0f0', // Muted
  'color-basic-500': '#e0e0e0', // Border
  'color-basic-600': '#666666', // Muted foreground
  'color-basic-700': '#333333', // Foreground
  'color-basic-800': '#1a1a1a',
  'color-basic-900': '#000000',
  'color-basic-transparent-100': 'rgba(51, 51, 51, 0.08)',
  'color-basic-transparent-200': 'rgba(51, 51, 51, 0.16)',
  'color-basic-transparent-300': 'rgba(51, 51, 51, 0.24)',
  'color-basic-transparent-400': 'rgba(51, 51, 51, 0.32)',
  'color-basic-transparent-500': 'rgba(51, 51, 51, 0.40)',
  'color-basic-transparent-600': 'rgba(51, 51, 51, 0.48)',

  'color-success-100': '#CCF5A3',
  'color-success-500': '#2D5109',
  'color-success-600': '#2D5109',
  'color-success-700': '#2D5109',

  'color-warning-100': '#F5E7A3',
  'color-warning-500': '#5C4E0A',
  'color-warning-600': '#5C4E0A',
  'color-warning-700': '#5C4E0A',

  'color-danger-100': '#F5B1A3',
  'color-danger-500': '#5C180A',
  'color-danger-600': '#5C180A',
  'color-danger-700': '#5C180A',

  'color-info-100': '#e5f4ff',
  'color-info-500': '#0066cc',
  'color-info-600': '#0066cc',
  'color-info-700': '#0066cc',
};

// Dark theme colors - sport green palette
const darkThemeColors = {
  'color-primary-100': '#2A3300',
  'color-primary-200': '#556600',
  'color-primary-300': '#7F9900',
  'color-primary-400': '#AACC00',
  'color-primary-500': '#D4FF00',
  'color-primary-600': '#DCFF33',
  'color-primary-700': '#E4FF66',
  'color-primary-800': '#ECFFA3',
  'color-primary-900': '#F7FFE0',
  'color-primary-transparent-100': 'rgba(212, 255, 0, 0.08)',
  'color-primary-transparent-200': 'rgba(212, 255, 0, 0.16)',
  'color-primary-transparent-300': 'rgba(212, 255, 0, 0.24)',
  'color-primary-transparent-400': 'rgba(212, 255, 0, 0.32)',
  'color-primary-transparent-500': 'rgba(212, 255, 0, 0.40)',
  'color-primary-transparent-600': 'rgba(212, 255, 0, 0.48)',

  'color-basic-100': '#0A1F16',
  'color-basic-200': '#131517',
  'color-basic-300': '#1B4332',
  'color-basic-400': '#2E3836',
  'color-basic-500': '#455450',
  'color-basic-600': '#8FA39E',
  'color-basic-700': '#F1F3F3',
  'color-basic-800': '#ffffff',
  'color-basic-900': '#ffffff',
  'color-basic-transparent-100': 'rgba(241, 243, 243, 0.08)',
  'color-basic-transparent-200': 'rgba(241, 243, 243, 0.16)',
  'color-basic-transparent-300': 'rgba(241, 243, 243, 0.24)',
  'color-basic-transparent-400': 'rgba(241, 243, 243, 0.32)',
  'color-basic-transparent-500': 'rgba(241, 243, 243, 0.40)',
  'color-basic-transparent-600': 'rgba(241, 243, 243, 0.48)',

  'background-basic-color-1': '#131517',
  'background-basic-color-2': '#0A1F16',
  'background-basic-color-3': '#1B4332',
  'background-basic-color-4': '#2E3836',

  'text-basic-color':    '#FFFFFF',
  'text-hint-color':     '#8FA39E',
  'text-disabled-color': '#738C86',

  'border-basic-color-1': '#1B4332',
  'border-basic-color-2': '#2E3836',
  'border-basic-color-3': '#455450',
  'border-basic-color-4': '#5C706B',
  'border-basic-color-5': '#738C86',

  'input-basic-background-color': '#F1F3F3',
  'input-basic-border-color': '#ABB3BA',
  'input-basic-text-color': '#5C6770',
  'input-basic-placeholder-color': '#5C6770',
  'input-basic-focus-border-color': '#D4FF00',
  'select-basic-background-color': '#F1F3F3',
  'select-basic-border-color': '#ABB3BA',

  'color-success-100': '#CCF5A3',
  'color-success-500': '#2D5109',
  'color-success-600': '#2D5109',
  'color-success-700': '#2D5109',

  'color-warning-100': '#F5E7A3',
  'color-warning-500': '#5C4E0A',
  'color-warning-600': '#5C4E0A',
  'color-warning-700': '#5C4E0A',

  'color-danger-100': '#F5B1A3',
  'color-danger-500': '#5C180A',
  'color-danger-600': '#5C180A',
  'color-danger-700': '#5C180A',

  'color-info-100': '#1a2a33',
  'color-info-500': '#4da6ff',
  'color-info-600': '#4da6ff',
  'color-info-700': '#4da6ff',
};

// Create custom light theme
export const lightTheme: ThemeType = {
  ...eva.light,
  ...lightThemeColors,
};

// Create custom dark theme
export const darkTheme: ThemeType = {
  ...eva.dark,
  ...darkThemeColors,
};
