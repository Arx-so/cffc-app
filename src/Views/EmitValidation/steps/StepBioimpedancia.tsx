import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["bioimpedancia"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["bioimpedancia"]>>) => void;
};

export const StepBioimpedancia = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.body_fat_pct")} value={data.body_fat_pct} onChangeNumber={(v) => onUpdate({ body_fat_pct: v })} />
      <StepNumericField label={t("emitValidation.fields.visceral_fat")} value={data.visceral_fat} onChangeNumber={(v) => onUpdate({ visceral_fat: v })} />
      <StepNumericField label={t("emitValidation.fields.muscle_mass_kg")} value={data.muscle_mass_kg} onChangeNumber={(v) => onUpdate({ muscle_mass_kg: v })} />
      <StepNumericField label={t("emitValidation.fields.hydration_pct")} value={data.hydration_pct} onChangeNumber={(v) => onUpdate({ hydration_pct: v })} />
      <StepNumericField label={t("emitValidation.fields.basal_metabolic_rate")} value={data.basal_metabolic_rate} onChangeNumber={(v) => onUpdate({ basal_metabolic_rate: v })} />
    </View>
  );
};
