import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["wingate"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["wingate"]>>) => void;
};

export const StepWingate = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.peak_power_w")} value={data.peak_power_w} onChangeNumber={(v) => onUpdate({ peak_power_w: v })} />
      <StepNumericField label={t("emitValidation.fields.mean_power_w")} value={data.mean_power_w} onChangeNumber={(v) => onUpdate({ mean_power_w: v })} />
      <StepNumericField label={t("emitValidation.fields.fatigue_index_pct")} value={data.fatigue_index_pct} onChangeNumber={(v) => onUpdate({ fatigue_index_pct: v })} />
    </View>
  );
};
