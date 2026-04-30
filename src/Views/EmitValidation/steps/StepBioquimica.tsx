import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["bioquimica"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["bioquimica"]>>) => void;
};

export const StepBioquimica = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.ast")} value={data.ast} onChangeNumber={(v) => onUpdate({ ast: v })} />
      <StepNumericField label={t("emitValidation.fields.alt")} value={data.alt} onChangeNumber={(v) => onUpdate({ alt: v })} />
      <StepNumericField label={t("emitValidation.fields.urea")} value={data.urea} onChangeNumber={(v) => onUpdate({ urea: v })} />
      <StepNumericField label={t("emitValidation.fields.creatinine")} value={data.creatinine} onChangeNumber={(v) => onUpdate({ creatinine: v })} />
      <StepNumericField label={t("emitValidation.fields.glucose")} value={data.glucose} onChangeNumber={(v) => onUpdate({ glucose: v })} />
      <StepNumericField label={t("emitValidation.fields.hba1c")} value={data.hba1c} onChangeNumber={(v) => onUpdate({ hba1c: v })} />
      <StepNumericField label={t("emitValidation.fields.total_cholesterol")} value={data.total_cholesterol} onChangeNumber={(v) => onUpdate({ total_cholesterol: v })} />
      <StepNumericField label={t("emitValidation.fields.ldl")} value={data.ldl} onChangeNumber={(v) => onUpdate({ ldl: v })} />
      <StepNumericField label={t("emitValidation.fields.hdl")} value={data.hdl} onChangeNumber={(v) => onUpdate({ hdl: v })} />
      <StepNumericField label={t("emitValidation.fields.tg")} value={data.tg} onChangeNumber={(v) => onUpdate({ tg: v })} />
      <StepNumericField label={t("emitValidation.fields.total_protein")} value={data.total_protein} onChangeNumber={(v) => onUpdate({ total_protein: v })} />
      <StepNumericField label={t("emitValidation.fields.albumin")} value={data.albumin} onChangeNumber={(v) => onUpdate({ albumin: v })} />
    </View>
  );
};
