import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["velocidade_aceleracao"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["velocidade_aceleracao"]>>) => void;
};

export const StepVelocidade = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.sprint_10m_s")} value={data.sprint_10m_s} onChangeNumber={(v) => onUpdate({ sprint_10m_s: v })} />
      <StepNumericField label={t("emitValidation.fields.sprint_20m_s")} value={data.sprint_20m_s} onChangeNumber={(v) => onUpdate({ sprint_20m_s: v })} />
      <StepNumericField label={t("emitValidation.fields.sprint_30m_s")} value={data.sprint_30m_s} onChangeNumber={(v) => onUpdate({ sprint_30m_s: v })} />
      <StepNumericField label={t("emitValidation.fields.sprint_40m_s")} value={data.sprint_40m_s} onChangeNumber={(v) => onUpdate({ sprint_40m_s: v })} />
    </View>
  );
};
