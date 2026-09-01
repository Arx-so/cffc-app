export interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface SettingsLanguageOption {
  key: string;
  label: string;
  selected: boolean;
}

export interface UseSettingsReturn {
  items: SettingItem[];
  isLanguageSheetOpen: boolean;
  languageSheetTitle: string;
  languageOptions: SettingsLanguageOption[];
  languageSheetCancelLabel: string;
  closeLanguageSheet: () => void;
  selectLanguage: (key: string) => void;
  isDeleteConfirmOpen: boolean;
  isDeletingAccount: boolean;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteConfirmCancelLabel: string;
  deleteConfirmButtonLabel: string;
  closeDeleteConfirm: () => void;
  confirmDeleteAccount: () => Promise<void>;
}
