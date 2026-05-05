import { submitValidation } from "@/processes/validation";
import { ValidationChecklist } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { UseEmitValidationReturn } from "./EmitValidation.types";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const STEP_KEYS: (keyof ValidationChecklist | "notes")[] = [
  "antropometria",
  "bioimpedancia",
  "dinamometria",
  "bioquimica",
  "vo2max",
  "yoyo_test",
  "shuttle_run_20m",
  "wingate",
  "rast",
  "forca_potencia",
  "velocidade_aceleracao",
  "agilidade",
  "resistencia_muscular",
  "flexibilidade",
  "acwr",
  "odontologia",
  "psicologia",
  "notes",
];

export const useEmitValidation = (): UseEmitValidationReturn => {
  const { t } = useTranslation();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [checklist, setChecklist] = useState<ValidationChecklist>({});
  const [note, setNote] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCategory = useCallback(
    <K extends keyof ValidationChecklist>(
      category: K,
      patch: Partial<NonNullable<ValidationChecklist[K]>>
    ) => {
      setChecklist((prev) => ({
        ...prev,
        [category]: { ...(prev[category] ?? {}), ...patch },
      }));
    },
    []
  );

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  }, []);

  const goPrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user?.id || !athleteId) return;
    setIsSubmitting(true);
    try {
      await submitValidation({
        athleteUserId: athleteId,
        professionalUserId: user.id,
        checklist,
        note,
      });
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["proProfile", user.id] }),
        queryClient.refetchQueries({ queryKey: ["validated-athletes", user.id] }),
        queryClient.invalidateQueries({
          queryKey: ["validation-exists", athleteId],
        }),
      ]);
      Toast.show({ type: "success", text1: t("emitValidation.submitSuccess") });
      router.back();
    } catch {
      Toast.show({ type: "error", text1: t("emitValidation.submitError") });
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, athleteId, checklist, note, queryClient, t]);

  return {
    checklist,
    updateCategory,
    note,
    setNote,
    currentStep,
    totalSteps: STEP_KEYS.length,
    stepKey: STEP_KEYS[currentStep],
    goNext,
    goPrevious,
    handleSubmit,
    isSubmitting,
  };
};
