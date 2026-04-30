import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["dinamometria"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["dinamometria"]>>) => void;
};

export const StepDinamometria = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.grip_left_kg")} value={data.grip_left_kg} onChangeNumber={(v) => onUpdate({ grip_left_kg: v })} />
      <StepNumericField label={t("emitValidation.fields.grip_right_kg")} value={data.grip_right_kg} onChangeNumber={(v) => onUpdate({ grip_right_kg: v })} />
    </View>
  );
};
