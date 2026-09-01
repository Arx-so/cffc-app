import { Modal, Text, TouchableOpacity } from "react-native";
import { styles } from "./OptionsSheet.styles";
import { OptionsSheetProps } from "./OptionsSheet.types";

// Bottom-sheet list of options — the React (and web-compatible) replacement
// for `Alert.alert(title, undefined, [option, option, ..., cancel])`.
export function OptionsSheet({
  visible,
  title,
  options,
  cancelLabel,
  onSelect,
  onClose,
}: OptionsSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1} onPress={() => {}}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionRow}
              onPress={() => onSelect(option.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.optionText,
                  option.selected && styles.optionTextSelected,
                  option.destructive && styles.optionTextDestructive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.cancelRow}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
