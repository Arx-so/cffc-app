import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepCheckboxField, StepTextField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["odontologia"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["odontologia"]>>) => void;
};

export const StepOdontologia = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepCheckboxField label={t("emitValidation.fields.exame_clinico_done")} value={data.exame_clinico_done} onToggle={(v) => onUpdate({ exame_clinico_done: v })} />
      <StepTextField label={t("emitValidation.fields.exame_clinico_notes")} value={data.exame_clinico_notes} onChangeText={(v) => onUpdate({ exame_clinico_notes: v })} />
      <StepCheckboxField label={t("emitValidation.fields.rx_panoramico_done")} value={data.rx_panoramico_done} onToggle={(v) => onUpdate({ rx_panoramico_done: v })} />
      <StepCheckboxField label={t("emitValidation.fields.rx_interproximal_done")} value={data.rx_interproximal_done} onToggle={(v) => onUpdate({ rx_interproximal_done: v })} />
      <StepTextField label={t("emitValidation.fields.rx_findings")} value={data.rx_findings} onChangeText={(v) => onUpdate({ rx_findings: v })} />
      <StepTextField label={t("emitValidation.fields.exames_complementares")} value={data.exames_complementares} onChangeText={(v) => onUpdate({ exames_complementares: v })} />
    </View>
  );
};
