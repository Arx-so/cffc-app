import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField, StepTextField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["agilidade"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["agilidade"]>>) => void;
};

export const StepAgilidade = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepTextField label={t("emitValidation.fields.test_name")} value={data.test_name} onChangeText={(v) => onUpdate({ test_name: v })} />
      <StepNumericField label={t("emitValidation.fields.time_s")} value={data.time_s} onChangeNumber={(v) => onUpdate({ time_s: v })} />
      <StepNumericField label={t("emitValidation.fields.score")} value={data.score} onChangeNumber={(v) => onUpdate({ score: v })} />
    </View>
  );
};
