import { ConfirmDialog } from "@/components/ConfirmDialog";
import { OptionsSheet } from "@/components/OptionsSheet";
import { Brand } from "@/constants/theme";
import { Icon, useTheme } from "@ui-kitten/components";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Settings.styles";
import { SettingItem } from "./Settings.types";
import { useSettings } from "./useSettings";

const SettingRow = ({ item, isLast }: { item: SettingItem; isLast: boolean }) => {
  const theme = useTheme();
  const iconColor = item.destructive ? Brand.danger : theme["color-primary-500"];
  const labelColor = item.destructive ? Brand.danger : Brand.white;

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={item.onPress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} fill={iconColor} style={{ width: 22, height: 22 }} />
        </View>
        <Text style={[styles.label, { color: labelColor }]}>{item.label}</Text>
        {item.value && <Text style={styles.value}>{item.value}</Text>}
        {!item.destructive && (
          <Icon
            name="chevron-right-outline"
            fill={Brand.gray}
            style={[styles.chevron, { width: 20, height: 20 }]}
          />
        )}
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};

const Settings = () => {
  const {
    items,
    isLanguageSheetOpen,
    languageSheetTitle,
    languageOptions,
    languageSheetCancelLabel,
    closeLanguageSheet,
    selectLanguage,
    isDeleteConfirmOpen,
    isDeletingAccount,
    deleteConfirmTitle,
    deleteConfirmMessage,
    deleteConfirmCancelLabel,
    deleteConfirmButtonLabel,
    closeDeleteConfirm,
    confirmDeleteAccount,
  } = useSettings();

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.section}>
        {items.map((item, index) => (
          <SettingRow key={item.label} item={item} isLast={index === items.length - 1} />
        ))}
      </View>

      <OptionsSheet
        visible={isLanguageSheetOpen}
        title={languageSheetTitle}
        options={languageOptions}
        cancelLabel={languageSheetCancelLabel}
        onSelect={selectLanguage}
        onClose={closeLanguageSheet}
      />

      <ConfirmDialog
        visible={isDeleteConfirmOpen}
        title={deleteConfirmTitle}
        message={deleteConfirmMessage}
        cancelLabel={deleteConfirmCancelLabel}
        confirmLabel={deleteConfirmButtonLabel}
        destructive
        isLoading={isDeletingAccount}
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDeleteAccount}
      />
    </ScrollView>
  );
};

export default Settings;
