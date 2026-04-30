import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StepNumericField, StepSelectField, StepTextField } from "./StepField";

type Props = {
  data: NonNullable<ValidationChecklist["psicologia"]>;
  onUpdate: (patch: Partial<NonNullable<ValidationChecklist["psicologia"]>>) => void;
};

export const StepPsicologia = ({ data, onUpdate }: Props) => {
  const { t } = useTranslation();
  return (
    <View>
      <StepNumericField label={t("emitValidation.fields.coping_acsi28")} value={data.coping_acsi28} onChangeNumber={(v) => onUpdate({ coping_acsi28: v })} />
      <StepNumericField label={t("emitValidation.fields.motivacao")} value={data.motivacao} onChangeNumber={(v) => onUpdate({ motivacao: v })} />
      <StepNumericField label={t("emitValidation.fields.csai2r_cognitive")} value={data.csai2r_cognitive} onChangeNumber={(v) => onUpdate({ csai2r_cognitive: v })} />
      <StepNumericField label={t("emitValidation.fields.csai2r_somatic")} value={data.csai2r_somatic} onChangeNumber={(v) => onUpdate({ csai2r_somatic: v })} />
      <StepNumericField label={t("emitValidation.fields.csai2r_self_confidence")} value={data.csai2r_self_confidence} onChangeNumber={(v) => onUpdate({ csai2r_self_confidence: v })} />
      <StepNumericField label={t("emitValidation.fields.brums_vigor")} value={data.brums_vigor} onChangeNumber={(v) => onUpdate({ brums_vigor: v })} />
      <StepNumericField label={t("emitValidation.fields.brums_tension")} value={data.brums_tension} onChangeNumber={(v) => onUpdate({ brums_tension: v })} />
      <StepNumericField label={t("emitValidation.fields.brums_depression")} value={data.brums_depression} onChangeNumber={(v) => onUpdate({ brums_depression: v })} />
      <StepNumericField label={t("emitValidation.fields.brums_anger")} value={data.brums_anger} onChangeNumber={(v) => onUpdate({ brums_anger: v })} />
      <StepNumericField label={t("emitValidation.fields.brums_fatigue")} value={data.brums_fatigue} onChangeNumber={(v) => onUpdate({ brums_fatigue: v })} />
      <StepNumericField label={t("emitValidation.fields.brums_confusion")} value={data.brums_confusion} onChangeNumber={(v) => onUpdate({ brums_confusion: v })} />
      <StepNumericField label={t("emitValidation.fields.group_integration_score")} value={data.group_integration_score} onChangeNumber={(v) => onUpdate({ group_integration_score: v })} />
      <StepSelectField
        label={t("emitValidation.fields.psychological_load")}
        value={data.psychological_load}
        options={[
          { key: "low" as const, label: t("emitValidation.psychologicalLoad.low") },
          { key: "medium" as const, label: t("emitValidation.psychologicalLoad.medium") },
          { key: "high" as const, label: t("emitValidation.psychologicalLoad.high") },
        ]}
        onSelect={(v) => onUpdate({ psychological_load: v })}
      />
      <StepTextField label={t("emitValidation.fields.cognitive_skills_notes")} value={data.cognitive_skills_notes} onChangeText={(v) => onUpdate({ cognitive_skills_notes: v })} multiline />
    </View>
  );
};
