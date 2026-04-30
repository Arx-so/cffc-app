import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField, StepSelectField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["yoyo_test"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["yoyo_test"]>>) => void;
};

export const StepYoyoTest = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepSelectField
        label={t("emitValidation.fields.yoyo_type")}
        value={data.type}
        options={[
          { key: "IR1" as const, label: t("emitValidation.yoyoType.IR1") },
          { key: "IR2" as const, label: t("emitValidation.yoyoType.IR2") },
        ]}
        onSelect={(v) => onUpdate({ type: v })}
      />
      <StepNumericField label={t("emitValidation.fields.distance_m")} value={data.distance_m} onChangeNumber={(v) => onUpdate({ distance_m: v })} />
      <StepNumericField label={t("emitValidation.fields.level")} value={data.level} onChangeNumber={(v) => onUpdate({ level: v })} />
      <StepNumericField label={t("emitValidation.fields.speed_km_h")} value={data.speed_km_h} onChangeNumber={(v) => onUpdate({ speed_km_h: v })} />
    </View>
  );
};
