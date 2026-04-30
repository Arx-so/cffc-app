import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["antropometria"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["antropometria"]>>) => void;
};

export const StepAntropometria = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.height_cm")} value={data.height_cm} onChangeNumber={(v) => onUpdate({ height_cm: v })} />
      <StepNumericField label={t("emitValidation.fields.weight_kg")} value={data.weight_kg} onChangeNumber={(v) => onUpdate({ weight_kg: v })} />
      <StepNumericField label={t("emitValidation.fields.bmi")} value={data.bmi} onChangeNumber={(v) => onUpdate({ bmi: v })} />
      <StepNumericField label={t("emitValidation.fields.wingspan_cm")} value={data.wingspan_cm} onChangeNumber={(v) => onUpdate({ wingspan_cm: v })} />
      <StepNumericField label={t("emitValidation.fields.body_fat_pct")} value={data.body_fat_pct} onChangeNumber={(v) => onUpdate({ body_fat_pct: v })} />
      <StepNumericField label={t("emitValidation.fields.lean_mass_kg")} value={data.lean_mass_kg} onChangeNumber={(v) => onUpdate({ lean_mass_kg: v })} />
    </View>
  );
};
