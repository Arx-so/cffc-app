import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["resistencia_muscular"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["resistencia_muscular"]>>) => void;
};

export const StepResistenciaMuscular = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.abdominal_reps")} value={data.abdominal_reps} onChangeNumber={(v) => onUpdate({ abdominal_reps: v })} />
      <StepNumericField label={t("emitValidation.fields.canguru_reps")} value={data.canguru_reps} onChangeNumber={(v) => onUpdate({ canguru_reps: v })} />
    </View>
  );
};
