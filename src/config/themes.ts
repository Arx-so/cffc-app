import * as eva from '@eva-design/eva';
import { ThemeType } from '@ui-kitten/components';
import { Brand } from '@/constants/theme';

const themeColors = {
  // Primary - neon green (#39FF14)
  'color-primary-100': '#CFFFBF',
  'color-primary-200': '#9FFF80',
  'color-primary-300': '#6FFF40',
  'color-primary-400': '#50FF2A',
  'color-primary-500': Brand.green,
  'color-primary-600': '#2ECC10',
  'color-primary-700': '#22990C',
  'color-primary-800': '#176608',
  'color-primary-900': '#0B3304',
  'color-primary-transparent-100': 'rgba(57, 255, 20, 0.08)',
  'color-primary-transparent-200': 'rgba(57, 255, 20, 0.16)',
  'color-primary-transparent-300': 'rgba(57, 255, 20, 0.24)',
  'color-primary-transparent-400': 'rgba(57, 255, 20, 0.32)',
  'color-primary-transparent-500': 'rgba(57, 255, 20, 0.40)',
  'color-primary-transparent-600': 'rgba(57, 255, 20, 0.48)',

  // Basic scale: 100 = lightest (text), 1100 = darkest (deep bg)
  'color-basic-100': Brand.white,
  'color-basic-200': '#F0F0F0',
  'color-basic-300': '#C0C0C0',
  'color-basic-400': '#999999',
  'color-basic-500': Brand.gray,
  'color-basic-600': '#555555',
  'color-basic-700': '#3A3A3A',
  'color-basic-800': Brand.border,
  'color-basic-900': Brand.card,
  'color-basic-1000': Brand.bg,
  'color-basic-1100': '#000000',
  'color-basic-transparent-100': 'rgba(255, 255, 255, 0.08)',
  'color-basic-transparent-200': 'rgba(255, 255, 255, 0.16)',
  'color-basic-transparent-300': 'rgba(255, 255, 255, 0.24)',
  'color-basic-transparent-400': 'rgba(255, 255, 255, 0.32)',
  'color-basic-transparent-500': 'rgba(255, 255, 255, 0.40)',
  'color-basic-transparent-600': 'rgba(255, 255, 255, 0.48)',

  // Semantic backgrounds
  'background-basic-color-1': Brand.card,
  'background-basic-color-2': Brand.bg,
  'background-basic-color-3': '#000000',
  'background-basic-color-4': '#000000',

  // Semantic text
  'text-basic-color': Brand.white,
  'text-alternate-color': Brand.white,
  'text-control-color': Brand.bg,
  'text-hint-color': Brand.gray,
  'text-disabled-color': '#3A3A3A',

  // Semantic borders
  'border-basic-color-1': Brand.card,
  'border-basic-color-2': Brand.border,
  'border-basic-color-3': '#3A3A3A',
  'border-basic-color-4': '#555555',
  'border-basic-color-5': Brand.gray,

  // Outline
  'outline-color': 'rgba(57, 255, 20, 0.32)',

  // Status colors
  'color-success-100': '#CFFFBF',
  'color-success-500': Brand.green,
  'color-success-600': '#2ECC10',
  'color-success-700': '#22990C',

  'color-warning-100': '#FFF9E0',
  'color-warning-500': '#FFD60A',
  'color-warning-600': '#CCB008',
  'color-warning-700': '#997506',

  'color-danger-100': '#FFE5E5',
  'color-danger-500': Brand.error,
  'color-danger-600': '#CC3636',
  'color-danger-700': '#992929',

  'color-info-100': '#E5F4FF',
  'color-info-500': '#64D2FF',
  'color-info-600': '#50A8CC',
  'color-info-700': '#3C7E99',
};

export const appTheme: ThemeType = {
  ...eva.dark,
  ...themeColors,
};
