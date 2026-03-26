import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

import i18n from '@/config/i18n';

export type Language = 'en' | 'ja' | 'pt-BR';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const normalizeLanguage = (language: string): Language => {
  if (language === 'pt-br' || language === 'pt-BR') return 'pt-BR';
  if (language === 'ja') return 'ja';
  return 'en';
};

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language: Language) => {
        const normalized = normalizeLanguage(language);
        i18n.changeLanguage(normalized);
        set({ language: normalized });
      },
    }),
    {
      name: 'language-store',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const normalized = normalizeLanguage(state.language);
        i18n.changeLanguage(normalized);
        if (state.language !== normalized) {
          state.setLanguage(normalized);
        }
      },
    },
  ),
);
