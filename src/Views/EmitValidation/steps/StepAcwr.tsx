import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["acwr"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["acwr"]>>) => void;
};

export const StepAcwr = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.acute_load")} value={data.acute_load} onChangeNumber={(v) => onUpdate({ acute_load: v })} />
      <StepNumericField label={t("emitValidation.fields.chronic_load")} value={data.chronic_load} onChangeNumber={(v) => onUpdate({ chronic_load: v })} />
      <StepNumericField label={t("emitValidation.fields.ratio")} value={data.ratio} onChangeNumber={(v) => onUpdate({ ratio: v })} />
    </View>
  );
};
