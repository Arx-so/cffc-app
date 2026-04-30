# Emit Validation Flow — Design Spec
Date: 2026-04-29

## Overview

When a user with role `pro` visits an athlete's profile, they can issue a comprehensive physical/psychological assessment ("validação") for that athlete. The validation data is stored in the existing `validation` table as a JSONB `checklist`, with `status: 'pending'` awaiting admin approval. The pro's own profile already shows recent validations they have issued.

---

## Architecture & Data Flow

### Entry Point

`src/app/visitor-profile.tsx` reads `role` from `useAuthStore` and passes it as `viewerRole` to the `VisitorProfile` component. When `viewerRole === "pro"`, a fixed "Emitir validação" button appears **below** the `ScrollView` (outside it, fixed at the bottom of the screen layout).

Tapping the button navigates to:
```
/emit-validation?athleteId=<uuid>&athleteName=<string>
```

### New Modal Screen

`src/app/emit-validation.tsx` is registered as `presentation: "modal"` in the root `_layout.tsx` stack. It mounts the `EmitValidation` view from `src/Views/EmitValidation/`.

### Multi-Step Wizard

All state lives in `useEmitValidation`. Steps are indexed 0–17 (17 category steps + 1 notes step = 18 total). A progress bar at the top shows `currentStep / totalSteps`. Navigation uses "Anterior" / "Próximo" buttons; the final step shows "Enviar".

### Submit

On submit, the hook calls `submitValidation()` from `src/processes/validation.ts`, which inserts a row into `validation`:
- `athlete_user_id`: from route params
- `professional_user_id`: from `useAuthStore` (current user id)
- `professional_role`: `"pro"` (the authenticated user's role string)
- `checklist`: JSONB object (structure below)
- `note`: free text from final step
- `status`: `'pending'`

On success: navigate back, invalidate `["pro-profile"]` react-query cache so the pro's profile refreshes.

### Pro Profile

No changes needed. `fetchProProfileScreenData` already fetches the last 10 validations (any status) and displays them in the "Recent Validations" section. The `issuedValidationCount` stat counts only `approved` ones.

---

## Checklist JSONB Structure

All fields are optional (`null` if not filled by the pro). The `checklist` column is typed as `ValidationChecklist` in `src/processes/types/profileTypes.ts`.

```typescript
interface ValidationChecklist {
  antropometria?: {
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    wingspan_cm?: number;
    body_fat_pct?: number;
    lean_mass_kg?: number;
  };
  bioimpedancia?: {
    body_fat_pct?: number;
    visceral_fat?: number;
    muscle_mass_kg?: number;
    hydration_pct?: number;
    basal_metabolic_rate?: number;
  };
  dinamometria?: {
    grip_left_kg?: number;
    grip_right_kg?: number;
  };
  bioquimica?: {
    ast?: number;
    alt?: number;
    urea?: number;
    creatinine?: number;
    glucose?: number;
    hba1c?: number;
    total_cholesterol?: number;
    ldl?: number;
    hdl?: number;
    tg?: number;
    total_protein?: number;
    albumin?: number;
  };
  vo2max?: {
    vo2max_ml_kg_min?: number;
    max_hr_bpm?: number;
    protocol?: string;
  };
  yoyo_test?: {
    type?: "IR1" | "IR2";
    distance_m?: number;
    level?: number;
    speed_km_h?: number;
  };
  shuttle_run_20m?: {
    time_s?: number;
    shuttles?: number;
  };
  wingate?: {
    peak_power_w?: number;
    mean_power_w?: number;
    fatigue_index_pct?: number;
  };
  rast?: {
    peak_power_w?: number;
    mean_power_w?: number;
    fatigue_index_pct?: number;
    best_sprint_s?: number;
  };
  forca_potencia?: {
    squat_jump_cm?: number;
    cmj_cm?: number;
    horizontal_jump_cm?: number;
  };
  velocidade_aceleracao?: {
    sprint_10m_s?: number;
    sprint_20m_s?: number;
    sprint_30m_s?: number;
    sprint_40m_s?: number;
  };
  agilidade?: {
    test_name?: string;
    time_s?: number;
    score?: number;
  };
  resistencia_muscular?: {
    abdominal_reps?: number;
    canguru_reps?: number;
  };
  flexibilidade?: {
    sit_and_reach_cm?: number;
  };
  acwr?: {
    acute_load?: number;
    chronic_load?: number;
    ratio?: number;
  };
  odontologia?: {
    exame_clinico_done?: boolean;
    exame_clinico_notes?: string;
    rx_panoramico_done?: boolean;
    rx_interproximal_done?: boolean;
    rx_findings?: string;
    exames_complementares?: string;
  };
  psicologia?: {
    coping_acsi28?: number;          // 0–100
    motivacao?: number;              // 1–5
    csai2r_cognitive?: number;
    csai2r_somatic?: number;
    csai2r_self_confidence?: number;
    brums_vigor?: number;            // 0–4
    brums_tension?: number;
    brums_depression?: number;
    brums_anger?: number;
    brums_fatigue?: number;
    brums_confusion?: number;
    group_integration_score?: number;
    psychological_load?: "low" | "medium" | "high";
    cognitive_skills_notes?: string;
  };
}
```

---

## New Files

```
src/processes/validation.ts
src/app/emit-validation.tsx
src/Views/EmitValidation/
  index.ts
  useEmitValidation.ts
  EmitValidation.tsx
  EmitValidation.types.ts
  EmitValidation.styles.ts
  steps/
    StepAntropometria.tsx
    StepBioimpedancia.tsx
    StepDinamometria.tsx
    StepBioquimica.tsx
    StepVo2max.tsx
    StepYoyoTest.tsx
    StepShuttleRun20m.tsx
    StepWingate.tsx
    StepRast.tsx
    StepForcaPotencia.tsx
    StepVelocidade.tsx
    StepAgilidade.tsx
    StepResistenciaMuscular.tsx
    StepFlexibilidade.tsx
    StepAcwr.tsx
    StepOdontologia.tsx
    StepPsicologia.tsx
    StepNotes.tsx
```

---

## Existing Files Changed

| File | Change |
|---|---|
| `src/app/_layout.tsx` | Register `emit-validation` as `presentation: "modal"` in root stack |
| `src/app/visitor-profile.tsx` | Read `role` from `useAuthStore`, pass as `viewerRole` to `VisitorProfile` |
| `src/Views/VisitorProfile/VisitorProfile.tsx` | Accept `viewerRole` prop; show sticky "Emitir validação" button when `pro` |
| `src/Views/VisitorProfile/VisitorProfile.types.ts` | Add `viewerRole?: UserRole` to `VisitorProfileProps` and return type |
| `src/Views/VisitorProfile/useVisitorProfile.ts` | Add `handleEmitValidation(athleteId, athleteName)` handler |
| `src/processes/types/profileTypes.ts` | Add `ValidationChecklist` interface |
| `src/locales/en.ts` | Add all new i18n keys |
| `src/locales/pt-br.ts` | Add all new i18n keys (Portuguese) |
| `src/locales/ja.ts` | Add all new i18n keys (Japanese) |

---

## Wizard Steps (18 total)

| # | Step key | Category |
|---|---|---|
| 0 | `antropometria` | Antropometria |
| 1 | `bioimpedancia` | Bioimpedância |
| 2 | `dinamometria` | Dinamometria |
| 3 | `bioquimica` | Bioquímica |
| 4 | `vo2max` | Potência e Capacidade Aeróbia (VO₂ máx) |
| 5 | `yoyo_test` | Yo-Yo Test (IR1/IR2) |
| 6 | `shuttle_run_20m` | Shuttle Run 20m |
| 7 | `wingate` | Teste de Wingate |
| 8 | `rast` | RAST |
| 9 | `forca_potencia` | Força e Potência Muscular |
| 10 | `velocidade_aceleracao` | Velocidade e Aceleração |
| 11 | `agilidade` | Agilidade |
| 12 | `resistencia_muscular` | Resistência Muscular Localizada |
| 13 | `flexibilidade` | Flexibilidade |
| 14 | `acwr` | Capacidade de Carga — ACWR |
| 15 | `odontologia` | Odontologia do Esporte |
| 16 | `psicologia` | Psicologia do Esporte |
| 17 | `notes` | Observações Gerais (free text note) |

---

## Field Types by Category

- **Numeric** (keyboard: `numeric`): all measurement and test result fields
- **Text** (keyboard: `default`): protocol name, test name, notes, findings, cognitive skills notes
- **Checkbox** (toggle/switch): odontologia boolean fields (`done` flags)
- **Select** (segmented control or radio buttons): `yoyo_test.type` (IR1/IR2), `psicologia.psychological_load` (low/medium/high)

---

## Constraints

- All fields are optional — the pro can skip any category and submit with only partial data
- Submit always sends `status: 'pending'`; admin approves/rejects via back-office
- The "Emitir validação" button is only visible when `viewerRole === "pro"` — athletes visiting other athletes see no button
- The pro's own profile section shows all validations (any status), sorted by recency

---

## i18n Key Groups

- `emitValidation.*` — wizard screen (title, buttons, steps, field labels)
- `validation.*` — shared validation domain terms (status labels etc.)
