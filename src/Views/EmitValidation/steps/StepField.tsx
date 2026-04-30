import { Brand } from "@/constants/theme";
import { Text } from "@ui-kitten/components";
import { useState } from "react";
import { Switch, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../EmitValidation.styles";

/** Labeled numeric input. Passes undefined to onChangeNumber when empty. */
export const StepNumericField = ({
  label,
  value,
  onChangeNumber,
}: {
  label: string;
  value: number | undefined;
  onChangeNumber: (v: number | undefined) => void;
}) => {
  const [text, setText] = useState(value !== undefined ? String(value) : "");
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={(v) => {
          setText(v);
          const parsed = parseFloat(v);
          onChangeNumber(v === "" || isNaN(parsed) ? undefined : parsed);
        }}
        keyboardType="numeric"
        placeholder="—"
        placeholderTextColor={Brand.gray}
      />
    </>
  );
};

/** Labeled free-text input. */
export const StepTextField = ({
  label,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string | undefined;
  onChangeText: (v: string) => void;
  multiline?: boolean;
}) => (
  <>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={multiline ? styles.notesInput : styles.textInput}
      value={value ?? ""}
      onChangeText={onChangeText}
      placeholder="—"
      placeholderTextColor={Brand.gray}
      multiline={multiline}
    />
  </>
);

/** Labeled boolean toggle row. */
export const StepCheckboxField = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean | undefined;
  onToggle: (v: boolean) => void;
}) => (
  <View style={styles.checkboxRow}>
    <Text style={styles.checkboxLabel}>{label}</Text>
    <Switch
      value={value ?? false}
      onValueChange={onToggle}
      trackColor={{ true: Brand.green, false: Brand.border }}
      thumbColor={Brand.white}
    />
  </View>
);

/** Labeled segmented control for a fixed set of string options. */
export const StepSelectField = <T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T | undefined;
  options: { key: T; label: string }[];
  onSelect: (v: T) => void;
}) => (
  <>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.segmentRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[
            styles.segmentOption,
            value === opt.key && styles.segmentOptionActive,
          ]}
          onPress={() => onSelect(opt.key)}
        >
          <Text
            style={[
              styles.segmentOptionText,
              value === opt.key && styles.segmentOptionTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </>
);
