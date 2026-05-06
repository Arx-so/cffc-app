import { Brand } from "@/constants/theme";
import { ValidationChecklist } from "@/processes/types/profileTypes";
import { bmiFromHeightWeightCmKg } from "@/utils/bmi";
import { Text } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { styles } from "../EmitValidation.styles";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["antropometria"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["antropometria"]>>) => void;
};

export const StepAntropometria = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  const bmi = bmiFromHeightWeightCmKg(data.height_cm, data.weight_kg);

  return (
    <View>
      <StepNumericField
        label={t("emitValidation.fields.height_cm")}
        value={data.height_cm}
        onChangeNumber={(v) =>
          onUpdate({
            height_cm: v,
            bmi: bmiFromHeightWeightCmKg(v, data.weight_kg),
          })
        }
      />
      <StepNumericField
        label={t("emitValidation.fields.weight_kg")}
        value={data.weight_kg}
        onChangeNumber={(v) =>
          onUpdate({
            weight_kg: v,
            bmi: bmiFromHeightWeightCmKg(data.height_cm, v),
          })
        }
      />
      <Text style={styles.fieldLabel}>{t("emitValidation.fields.bmi")}</Text>
      <Text
        style={[styles.textInput, bmi === undefined && { color: Brand.gray }]}
      >
        {bmi !== undefined ? String(bmi) : "—"}
      </Text>
      <StepNumericField label={t("emitValidation.fields.wingspan_cm")} value={data.wingspan_cm} onChangeNumber={(v) => onUpdate({ wingspan_cm: v })} />
      <StepNumericField label={t("emitValidation.fields.body_fat_pct")} value={data.body_fat_pct} onChangeNumber={(v) => onUpdate({ body_fat_pct: v })} />
      <StepNumericField label={t("emitValidation.fields.lean_mass_kg")} value={data.lean_mass_kg} onChangeNumber={(v) => onUpdate({ lean_mass_kg: v })} />
    </View>
  );
};
