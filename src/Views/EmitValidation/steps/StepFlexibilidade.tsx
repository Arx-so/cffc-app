import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["flexibilidade"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["flexibilidade"]>>) => void;
};

export const StepFlexibilidade = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.sit_and_reach_cm")} value={data.sit_and_reach_cm} onChangeNumber={(v) => onUpdate({ sit_and_reach_cm: v })} />
    </View>
  );
};
