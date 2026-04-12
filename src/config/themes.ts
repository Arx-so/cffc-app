import * as eva from '@eva-design/eva';
import { ThemeType } from '@ui-kitten/components';

// Light theme colors - sport green palette
const lightThemeColors = {
  'color-primary-100': '#e8f5e9',
  'color-primary-200': '#c8e6c9',
  'color-primary-300': '#a5d6a7',
  'color-primary-400': '#66bb6a',
  'color-primary-500': '#2e7d32', // Main accent color
  'color-primary-600': '#256427',
  'color-primary-700': '#1b4b1d',
  'color-primary-800': '#113213',
  'color-primary-900': '#071909',
  'color-primary-transparent-100': 'rgba(46, 125, 50, 0.08)',
  'color-primary-transparent-200': 'rgba(46, 125, 50, 0.16)',
  'color-primary-transparent-300': 'rgba(46, 125, 50, 0.24)',
  'color-primary-transparent-400': 'rgba(46, 125, 50, 0.32)',
  'color-primary-transparent-500': 'rgba(46, 125, 50, 0.40)',
  'color-primary-transparent-600': 'rgba(46, 125, 50, 0.48)',

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

  'color-success-100': '#dff2e1',
  'color-success-500': '#1b7a3a',
  'color-success-600': '#1b7a3a',
  'color-success-700': '#1b7a3a',

  'color-warning-100': '#fff4e5',
  'color-warning-500': '#e1b346',
  'color-warning-600': '#664400',
  'color-warning-700': '#664400',

  'color-danger-100': '#ffe5e5',
  'color-danger-500': '#e63946',
  'color-danger-600': '#e63946',
  'color-danger-700': '#e63946',

  'color-info-100': '#e5f4ff',
  'color-info-500': '#0066cc',
  'color-info-600': '#0066cc',
  'color-info-700': '#0066cc',
};

// Dark theme colors - sport green palette
const darkThemeColors = {
  'color-primary-100': '#071909',
  'color-primary-200': '#113213',
  'color-primary-300': '#1b4b1d',
  'color-primary-400': '#256427',
  'color-primary-500': '#39FF14', // Brand.green - neon accent
  'color-primary-600': '#66bb6a',
  'color-primary-700': '#a5d6a7',
  'color-primary-800': '#c8e6c9',
  'color-primary-900': '#e8f5e9',
  'color-primary-transparent-100': 'rgba(57, 255, 20, 0.08)',
  'color-primary-transparent-200': 'rgba(57, 255, 20, 0.16)',
  'color-primary-transparent-300': 'rgba(57, 255, 20, 0.24)',
  'color-primary-transparent-400': 'rgba(57, 255, 20, 0.32)',
  'color-primary-transparent-500': 'rgba(57, 255, 20, 0.40)',
  'color-primary-transparent-600': 'rgba(57, 255, 20, 0.48)',

  'color-basic-100': '#2a2a2a',
  'color-basic-200': '#333333',
  'color-basic-300': '#363636',
  'color-basic-400': '#3a3a3a',
  'color-basic-500': '#444444',
  'color-basic-600': '#c0c0c0',
  'color-basic-700': '#fdfdfd',
  'color-basic-800': '#ffffff',
  'color-basic-900': '#ffffff',
  'color-basic-transparent-100': 'rgba(253, 253, 253, 0.08)',
  'color-basic-transparent-200': 'rgba(253, 253, 253, 0.16)',
  'color-basic-transparent-300': 'rgba(253, 253, 253, 0.24)',
  'color-basic-transparent-400': 'rgba(253, 253, 253, 0.32)',
  'color-basic-transparent-500': 'rgba(253, 253, 253, 0.40)',
  'color-basic-transparent-600': 'rgba(253, 253, 253, 0.48)',

  // Explicit semantic background tokens — override Eva's computed values
  // which otherwise resolve to white because color-basic-800/900 = #ffffff
  'background-basic-color-1': '#0B0B0B', // Brand.bg  — main screen background
  'background-basic-color-2': '#1A1A1A', // Brand.card — header / elevated surfaces
  'background-basic-color-3': '#2A2A2A', // Brand.border — inputs / subtle surfaces
  'background-basic-color-4': '#333333', // — hover / selected state

  // Explicit semantic text tokens for correct contrast
  'text-basic-color':    '#FFFFFF', // Brand.white
  'text-hint-color':     '#777777', // Brand.gray
  'text-disabled-color': '#555555',

  // Explicit border tokens
  'border-basic-color-1': '#1A1A1A',
  'border-basic-color-2': '#2A2A2A', // Brand.border
  'border-basic-color-3': '#3A3A3A',
  'border-basic-color-4': '#444444',
  'border-basic-color-5': '#555555',

  'color-success-100': '#1b3a1f',
  'color-success-500': '#4caf50',
  'color-success-600': '#4caf50',
  'color-success-700': '#4caf50',

  'color-warning-100': '#332a00',
  'color-warning-500': '#ffb020',
  'color-warning-600': '#ffb020',
  'color-warning-700': '#ffb020',

  'color-danger-100': '#331a1c',
  'color-danger-500': '#e63946',
  'color-danger-600': '#e63946',
  'color-danger-700': '#e63946',

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
