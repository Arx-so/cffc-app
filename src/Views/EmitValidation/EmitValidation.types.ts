import { ValidationChecklist } from "@/processes/types/profileTypes";

export interface UseEmitValidationReturn {
  checklist: ValidationChecklist;
  updateCategory: <K extends keyof ValidationChecklist>(
    category: K,
    patch: Partial<NonNullable<ValidationChecklist[K]>>
  ) => void;
  note: string;
  setNote: (note: string) => void;
  currentStep: number;
  totalSteps: number;
  stepKey: string;
  goNext: () => void;
  goPrevious: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
}
