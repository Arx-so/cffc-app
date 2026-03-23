export interface SettingItem {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface UseSettingsReturn {
  items: SettingItem[];
}
