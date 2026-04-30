import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["forca_potencia"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["forca_potencia"]>>) => void;
};

export const StepForcaPotencia = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.squat_jump_cm")} value={data.squat_jump_cm} onChangeNumber={(v) => onUpdate({ squat_jump_cm: v })} />
      <StepNumericField label={t("emitValidation.fields.cmj_cm")} value={data.cmj_cm} onChangeNumber={(v) => onUpdate({ cmj_cm: v })} />
      <StepNumericField label={t("emitValidation.fields.horizontal_jump_cm")} value={data.horizontal_jump_cm} onChangeNumber={(v) => onUpdate({ horizontal_jump_cm: v })} />
    </View>
  );
};
