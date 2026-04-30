import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField, StepTextField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["vo2max"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["vo2max"]>>) => void;
};

export const StepVo2max = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.vo2max_ml_kg_min")} value={data.vo2max_ml_kg_min} onChangeNumber={(v) => onUpdate({ vo2max_ml_kg_min: v })} />
      <StepNumericField label={t("emitValidation.fields.max_hr_bpm")} value={data.max_hr_bpm} onChangeNumber={(v) => onUpdate({ max_hr_bpm: v })} />
      <StepTextField label={t("emitValidation.fields.protocol")} value={data.protocol} onChangeText={(v) => onUpdate({ protocol: v })} />
    </View>
  );
};
