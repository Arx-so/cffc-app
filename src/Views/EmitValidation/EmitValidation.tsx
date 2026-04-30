import { Layout, Text, Button, Spinner } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View, TouchableOpacity } from "react-native";

import { useEmitValidation } from "./useEmitValidation";
import { styles } from "./EmitValidation.styles";
import { StepAntropometria } from "./steps/StepAntropometria";
import { StepBioimpedancia } from "./steps/StepBioimpedancia";
import { StepDinamometria } from "./steps/StepDinamometria";
import { StepBioquimica } from "./steps/StepBioquimica";
import { StepVo2max } from "./steps/StepVo2max";
import { StepYoyoTest } from "./steps/StepYoyoTest";
import { StepShuttleRun20m } from "./steps/StepShuttleRun20m";
import { StepWingate } from "./steps/StepWingate";
import { StepRast } from "./steps/StepRast";
import { StepForcaPotencia } from "./steps/StepForcaPotencia";
import { StepVelocidade } from "./steps/StepVelocidade";
import { StepAgilidade } from "./steps/StepAgilidade";
import { StepResistenciaMuscular } from "./steps/StepResistenciaMuscular";
import { StepFlexibilidade } from "./steps/StepFlexibilidade";
import { StepAcwr } from "./steps/StepAcwr";
import { StepOdontologia } from "./steps/StepOdontologia";
import { StepPsicologia } from "./steps/StepPsicologia";
import { StepNotes } from "./steps/StepNotes";
import { ValidationChecklist } from "@/processes/types/profileTypes";

export const EmitValidation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { athleteName } = useLocalSearchParams<{
    athleteId: string;
    athleteName: string;
  }>();

  const decodedAthleteName = athleteName ? decodeURIComponent(athleteName) : "";

  const {
    checklist,
    updateCategory,
    note,
    setNote,
    currentStep,
    totalSteps,
    stepKey,
    goNext,
    goPrevious,
    handleSubmit,
    isSubmitting,
  } = useEmitValidation();

  const renderStep = () => {
    switch (stepKey) {
      case "antropometria":
        return (
          <StepAntropometria
            data={checklist.antropometria ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "antropometria",
                patch as Partial<NonNullable<ValidationChecklist["antropometria"]>>
              )
            }
          />
        );
      case "bioimpedancia":
        return (
          <StepBioimpedancia
            data={checklist.bioimpedancia ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "bioimpedancia",
                patch as Partial<NonNullable<ValidationChecklist["bioimpedancia"]>>
              )
            }
          />
        );
      case "dinamometria":
        return (
          <StepDinamometria
            data={checklist.dinamometria ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "dinamometria",
                patch as Partial<NonNullable<ValidationChecklist["dinamometria"]>>
              )
            }
          />
        );
      case "bioquimica":
        return (
          <StepBioquimica
            data={checklist.bioquimica ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "bioquimica",
                patch as Partial<NonNullable<ValidationChecklist["bioquimica"]>>
              )
            }
          />
        );
      case "vo2max":
        return (
          <StepVo2max
            data={checklist.vo2max ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "vo2max",
                patch as Partial<NonNullable<ValidationChecklist["vo2max"]>>
              )
            }
          />
        );
      case "yoyo_test":
        return (
          <StepYoyoTest
            data={checklist.yoyo_test ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "yoyo_test",
                patch as Partial<NonNullable<ValidationChecklist["yoyo_test"]>>
              )
            }
          />
        );
      case "shuttle_run_20m":
        return (
          <StepShuttleRun20m
            data={checklist.shuttle_run_20m ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "shuttle_run_20m",
                patch as Partial<NonNullable<ValidationChecklist["shuttle_run_20m"]>>
              )
            }
          />
        );
      case "wingate":
        return (
          <StepWingate
            data={checklist.wingate ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "wingate",
                patch as Partial<NonNullable<ValidationChecklist["wingate"]>>
              )
            }
          />
        );
      case "rast":
        return (
          <StepRast
            data={checklist.rast ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "rast",
                patch as Partial<NonNullable<ValidationChecklist["rast"]>>
              )
            }
          />
        );
      case "forca_potencia":
        return (
          <StepForcaPotencia
            data={checklist.forca_potencia ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "forca_potencia",
                patch as Partial<NonNullable<ValidationChecklist["forca_potencia"]>>
              )
            }
          />
        );
      case "velocidade_aceleracao":
        return (
          <StepVelocidade
            data={checklist.velocidade_aceleracao ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "velocidade_aceleracao",
                patch as Partial<NonNullable<ValidationChecklist["velocidade_aceleracao"]>>
              )
            }
          />
        );
      case "agilidade":
        return (
          <StepAgilidade
            data={checklist.agilidade ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "agilidade",
                patch as Partial<NonNullable<ValidationChecklist["agilidade"]>>
              )
            }
          />
        );
      case "resistencia_muscular":
        return (
          <StepResistenciaMuscular
            data={checklist.resistencia_muscular ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "resistencia_muscular",
                patch as Partial<NonNullable<ValidationChecklist["resistencia_muscular"]>>
              )
            }
          />
        );
      case "flexibilidade":
        return (
          <StepFlexibilidade
            data={checklist.flexibilidade ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "flexibilidade",
                patch as Partial<NonNullable<ValidationChecklist["flexibilidade"]>>
              )
            }
          />
        );
      case "acwr":
        return (
          <StepAcwr
            data={checklist.acwr ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "acwr",
                patch as Partial<NonNullable<ValidationChecklist["acwr"]>>
              )
            }
          />
        );
      case "odontologia":
        return (
          <StepOdontologia
            data={checklist.odontologia ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "odontologia",
                patch as Partial<NonNullable<ValidationChecklist["odontologia"]>>
              )
            }
          />
        );
      case "psicologia":
        return (
          <StepPsicologia
            data={checklist.psicologia ?? {}}
            onUpdate={(patch) =>
              updateCategory(
                "psicologia",
                patch as Partial<NonNullable<ValidationChecklist["psicologia"]>>
              )
            }
          />
        );
      case "notes":
        return <StepNotes note={note} onChangeNote={setNote} />;
      default:
        return null;
    }
  };

  const progressWidth = `${Math.round(((currentStep + 1) / totalSteps) * 100)}%` as const;

  return (
    <Layout style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerBackText}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {decodedAthleteName}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>

      {/* Step counter, title, and skip hint */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepCounter}>
          {t("emitValidation.step", {
            current: currentStep + 1,
            total: totalSteps,
          })}
        </Text>
        <Text style={styles.stepTitle}>
          {t(`emitValidation.steps.${stepKey}`)}
        </Text>
      </View>
      <Text style={styles.skipHint}>{t("emitValidation.skipHint")}</Text>

      {/* Step content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            style={styles.footerButton}
            appearance="outline"
            status="basic"
            onPress={goPrevious}
          >
            {t("emitValidation.previous")}
          </Button>
        )}

        {currentStep < totalSteps - 1 ? (
          <Button
            style={styles.footerButton}
            status="success"
            onPress={goNext}
          >
            {t("emitValidation.next")}
          </Button>
        ) : (
          <Button
            style={styles.footerButton}
            status="success"
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessoryLeft={
              isSubmitting ? () => <Spinner size="small" status="basic" /> : undefined
            }
          >
            {isSubmitting
              ? t("emitValidation.submitting")
              : t("emitValidation.submit")}
          </Button>
        )}
      </View>
    </Layout>
  );
};
