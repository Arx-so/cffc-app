import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["shuttle_run_20m"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["shuttle_run_20m"]>>) => void;
};

export const StepShuttleRun20m = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.time_s")} value={data.time_s} onChangeNumber={(v) => onUpdate({ time_s: v })} />
      <StepNumericField label={t("emitValidation.fields.shuttles")} value={data.shuttles} onChangeNumber={(v) => onUpdate({ shuttles: v })} />
    </View>
  );
};
