import { Brand } from "@/constants/theme";
import { Text } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";
import { styles } from "../EmitValidation.styles";

type Props = {
  note: string;
  onChangeNote: (note: string) => void;
};

export const StepNotes = ({ note, onChangeNote }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text style={styles.fieldLabel}>{t("emitValidation.notesLabel")}</Text>
      <TextInput
        style={styles.notesInput}
        value={note}
        onChangeText={onChangeNote}
        placeholder={t("emitValidation.notesPlaceholder")}
        placeholderTextColor={Brand.formInputPlaceholder}
        multiline
      />
    </View>
  );
};
