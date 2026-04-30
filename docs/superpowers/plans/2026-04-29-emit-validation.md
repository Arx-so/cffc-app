# Emit Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow pro users to issue comprehensive athlete assessments ("validações") directly from the athlete's visitor profile, storing all data as JSONB in the existing `validation` table.

**Architecture:** A multi-step wizard (18 steps) opens as a root-stack modal when a `pro` user taps "Emitir validação" on any athlete profile. All state lives in `useEmitValidation`; on submit it inserts a `pending` row into `validation`. The pro's profile already shows recent validations — no changes needed there.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase, react-query, react-i18next, UI Kitten, Brand theme tokens

---

## File Map

**New files:**
- `src/processes/types/profileTypes.ts` — add `ValidationChecklist` (modify)
- `src/processes/validation.ts` — `submitValidation()` API call
- `src/app/emit-validation.tsx` — route screen (modal)
- `src/Views/EmitValidation/EmitValidation.types.ts`
- `src/Views/EmitValidation/EmitValidation.styles.ts`
- `src/Views/EmitValidation/useEmitValidation.ts`
- `src/Views/EmitValidation/EmitValidation.tsx`
- `src/Views/EmitValidation/index.ts`
- `src/Views/EmitValidation/steps/StepField.tsx` — shared field components
- `src/Views/EmitValidation/steps/StepAntropometria.tsx`
- `src/Views/EmitValidation/steps/StepBioimpedancia.tsx`
- `src/Views/EmitValidation/steps/StepDinamometria.tsx`
- `src/Views/EmitValidation/steps/StepBioquimica.tsx`
- `src/Views/EmitValidation/steps/StepVo2max.tsx`
- `src/Views/EmitValidation/steps/StepYoyoTest.tsx`
- `src/Views/EmitValidation/steps/StepShuttleRun20m.tsx`
- `src/Views/EmitValidation/steps/StepWingate.tsx`
- `src/Views/EmitValidation/steps/StepRast.tsx`
- `src/Views/EmitValidation/steps/StepForcaPotencia.tsx`
- `src/Views/EmitValidation/steps/StepVelocidade.tsx`
- `src/Views/EmitValidation/steps/StepAgilidade.tsx`
- `src/Views/EmitValidation/steps/StepResistenciaMuscular.tsx`
- `src/Views/EmitValidation/steps/StepFlexibilidade.tsx`
- `src/Views/EmitValidation/steps/StepAcwr.tsx`
- `src/Views/EmitValidation/steps/StepOdontologia.tsx`
- `src/Views/EmitValidation/steps/StepPsicologia.tsx`
- `src/Views/EmitValidation/steps/StepNotes.tsx`

**Modified files:**
- `src/app/_layout.tsx` — register `emit-validation` modal
- `src/app/visitor-profile.tsx` — pass `viewerRole` from auth store
- `src/Views/VisitorProfile/VisitorProfile.types.ts` — add `viewerRole`
- `src/Views/VisitorProfile/useVisitorProfile.ts` — add `handleEmitValidation`
- `src/Views/VisitorProfile/VisitorProfile.tsx` — show emit button for pro
- `src/locales/en.ts` — add `emitValidation` keys
- `src/locales/pt-br.ts` — add `emitValidation` keys
- `src/locales/ja.ts` — add `emitValidation` keys

---

## Task 1: Add ValidationChecklist type to profileTypes.ts

**Files:**
- Modify: `src/processes/types/profileTypes.ts`

- [ ] **Step 1: Add the type after the existing `ProProfileScreenData` interface**

  In `src/processes/types/profileTypes.ts`, append at the end of the file:

  ```typescript
  export interface ValidationChecklist {
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
      coping_acsi28?: number;
      motivacao?: number;
      csai2r_cognitive?: number;
      csai2r_somatic?: number;
      csai2r_self_confidence?: number;
      brums_vigor?: number;
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

- [ ] **Step 2: Commit**

  ```bash
  git add src/processes/types/profileTypes.ts
  git commit -m "feat(types): add ValidationChecklist interface"
  ```

---

## Task 2: Add i18n keys to all locale files

**Files:**
- Modify: `src/locales/en.ts`, `src/locales/pt-br.ts`, `src/locales/ja.ts`

- [ ] **Step 1: Add emitValidation keys to `src/locales/en.ts`**

  Append the following block inside the `export default { ... }` object, after the last existing key:

  ```typescript
  emitValidation: {
    title: "Issue Validation",
    emitButton: "Issue Validation",
    step: "Step {{current}} of {{total}}",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    submitting: "Submitting...",
    submitSuccess: "Validation submitted for review",
    submitError: "Could not submit validation",
    skipHint: "All fields are optional",
    steps: {
      antropometria: "Anthropometry",
      bioimpedancia: "Bioimpedance",
      dinamometria: "Dynamometry",
      bioquimica: "Biochemistry",
      vo2max: "Aerobic Capacity (VO\u2082 max)",
      yoyo_test: "Yo-Yo Test",
      shuttle_run_20m: "Shuttle Run 20m",
      wingate: "Wingate Test",
      rast: "RAST",
      forca_potencia: "Strength & Power",
      velocidade_aceleracao: "Speed & Acceleration",
      agilidade: "Agility",
      resistencia_muscular: "Muscular Endurance",
      flexibilidade: "Flexibility",
      acwr: "Training Load (ACWR)",
      odontologia: "Sports Dentistry",
      psicologia: "Sports Psychology",
      notes: "General Notes",
    },
    fields: {
      height_cm: "Height (cm)",
      weight_kg: "Weight (kg)",
      bmi: "BMI",
      wingspan_cm: "Wingspan (cm)",
      body_fat_pct: "Body Fat (%)",
      lean_mass_kg: "Lean Mass (kg)",
      visceral_fat: "Visceral Fat",
      muscle_mass_kg: "Muscle Mass (kg)",
      hydration_pct: "Hydration (%)",
      basal_metabolic_rate: "Basal Metabolic Rate (kcal)",
      grip_left_kg: "Left Grip (kg)",
      grip_right_kg: "Right Grip (kg)",
      ast: "AST (U/L)",
      alt: "ALT (U/L)",
      urea: "Urea (mg/dL)",
      creatinine: "Creatinine (mg/dL)",
      glucose: "Glucose (mg/dL)",
      hba1c: "HbA1c (%)",
      total_cholesterol: "Total Cholesterol (mg/dL)",
      ldl: "LDL (mg/dL)",
      hdl: "HDL (mg/dL)",
      tg: "Triglycerides (mg/dL)",
      total_protein: "Total Protein (g/dL)",
      albumin: "Albumin (g/dL)",
      vo2max_ml_kg_min: "VO\u2082 max (mL/kg/min)",
      max_hr_bpm: "Max HR (bpm)",
      protocol: "Protocol",
      yoyo_type: "Type",
      distance_m: "Distance (m)",
      level: "Level",
      speed_km_h: "Speed (km/h)",
      time_s: "Time (s)",
      shuttles: "Shuttles",
      peak_power_w: "Peak Power (W)",
      mean_power_w: "Mean Power (W)",
      fatigue_index_pct: "Fatigue Index (%)",
      best_sprint_s: "Best Sprint (s)",
      squat_jump_cm: "Squat Jump (cm)",
      cmj_cm: "CMJ (cm)",
      horizontal_jump_cm: "Horizontal Jump (cm)",
      sprint_10m_s: "10m Sprint (s)",
      sprint_20m_s: "20m Sprint (s)",
      sprint_30m_s: "30m Sprint (s)",
      sprint_40m_s: "40m Sprint (s)",
      test_name: "Test Name",
      score: "Score",
      abdominal_reps: "Abdominal (reps)",
      canguru_reps: "Canguru (reps)",
      sit_and_reach_cm: "Sit & Reach (cm)",
      acute_load: "Acute Load",
      chronic_load: "Chronic Load",
      ratio: "ACWR Ratio",
      exame_clinico_done: "Clinical Exam Done",
      exame_clinico_notes: "Clinical Exam Notes",
      rx_panoramico_done: "Panoramic X-ray Done",
      rx_interproximal_done: "Interproximal X-ray Done",
      rx_findings: "X-ray Findings",
      exames_complementares: "Additional Exams",
      coping_acsi28: "Coping — ACSI-28 (0\u2013100)",
      motivacao: "Motivation (1\u20135)",
      csai2r_cognitive: "Cognitive Anxiety — CSAI-2R",
      csai2r_somatic: "Somatic Anxiety — CSAI-2R",
      csai2r_self_confidence: "Self-Confidence — CSAI-2R",
      brums_vigor: "Vigor — BRUMS (0\u20134)",
      brums_tension: "Tension — BRUMS (0\u20134)",
      brums_depression: "Depression — BRUMS (0\u20134)",
      brums_anger: "Anger — BRUMS (0\u20134)",
      brums_fatigue: "Fatigue — BRUMS (0\u20134)",
      brums_confusion: "Confusion — BRUMS (0\u20134)",
      group_integration_score: "Group Integration Score",
      psychological_load: "Psychological Load",
      cognitive_skills_notes: "Cognitive Skills Notes",
    },
    psychologicalLoad: {
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    yoyoType: {
      IR1: "IR1",
      IR2: "IR2",
    },
    notesLabel: "General Observations",
    notesPlaceholder: "Add any overall notes or observations...",
  },
  ```

- [ ] **Step 2: Add emitValidation keys to `src/locales/pt-br.ts`**

  Append the same block with Portuguese translations:

  ```typescript
  emitValidation: {
    title: "Emitir Validação",
    emitButton: "Emitir validação",
    step: "Passo {{current}} de {{total}}",
    next: "Próximo",
    previous: "Anterior",
    submit: "Enviar",
    submitting: "Enviando...",
    submitSuccess: "Validação enviada para análise",
    submitError: "Não foi possível enviar a validação",
    skipHint: "Todos os campos são opcionais",
    steps: {
      antropometria: "Antropometria",
      bioimpedancia: "Bioimpedância",
      dinamometria: "Dinamometria",
      bioquimica: "Bioquímica",
      vo2max: "Capacidade Aeróbia (VO\u2082 máx)",
      yoyo_test: "Yo-Yo Test",
      shuttle_run_20m: "Shuttle Run 20m",
      wingate: "Teste de Wingate",
      rast: "RAST",
      forca_potencia: "Força e Potência Muscular",
      velocidade_aceleracao: "Velocidade e Aceleração",
      agilidade: "Agilidade",
      resistencia_muscular: "Resistência Muscular Localizada",
      flexibilidade: "Flexibilidade",
      acwr: "Carga de Treino (ACWR)",
      odontologia: "Odontologia do Esporte",
      psicologia: "Psicologia do Esporte",
      notes: "Observações Gerais",
    },
    fields: {
      height_cm: "Altura (cm)",
      weight_kg: "Peso (kg)",
      bmi: "IMC",
      wingspan_cm: "Envergadura (cm)",
      body_fat_pct: "Gordura Corporal (%)",
      lean_mass_kg: "Massa Magra (kg)",
      visceral_fat: "Gordura Visceral",
      muscle_mass_kg: "Massa Muscular (kg)",
      hydration_pct: "Hidratação (%)",
      basal_metabolic_rate: "Taxa Metabólica Basal (kcal)",
      grip_left_kg: "Preensão Esquerda (kg)",
      grip_right_kg: "Preensão Direita (kg)",
      ast: "AST (U/L)",
      alt: "ALT (U/L)",
      urea: "Ureia (mg/dL)",
      creatinine: "Creatinina (mg/dL)",
      glucose: "Glicose (mg/dL)",
      hba1c: "Hemoglobina Glicada (%)",
      total_cholesterol: "Colesterol Total (mg/dL)",
      ldl: "LDL (mg/dL)",
      hdl: "HDL (mg/dL)",
      tg: "Triglicerídeos (mg/dL)",
      total_protein: "Proteína Total (g/dL)",
      albumin: "Albumina (g/dL)",
      vo2max_ml_kg_min: "VO\u2082 máx (mL/kg/min)",
      max_hr_bpm: "FC Máxima (bpm)",
      protocol: "Protocolo",
      yoyo_type: "Tipo",
      distance_m: "Distância (m)",
      level: "Nível",
      speed_km_h: "Velocidade (km/h)",
      time_s: "Tempo (s)",
      shuttles: "Shuttles",
      peak_power_w: "Potência Pico (W)",
      mean_power_w: "Potência Média (W)",
      fatigue_index_pct: "Índice de Fadiga (%)",
      best_sprint_s: "Melhor Sprint (s)",
      squat_jump_cm: "Squat Jump (cm)",
      cmj_cm: "CMJ (cm)",
      horizontal_jump_cm: "Salto Horizontal (cm)",
      sprint_10m_s: "Sprint 10m (s)",
      sprint_20m_s: "Sprint 20m (s)",
      sprint_30m_s: "Sprint 30m (s)",
      sprint_40m_s: "Sprint 40m (s)",
      test_name: "Nome do Teste",
      score: "Pontuação",
      abdominal_reps: "Abdominal (reps)",
      canguru_reps: "Canguru (reps)",
      sit_and_reach_cm: "Sentar e Alcançar (cm)",
      acute_load: "Carga Aguda",
      chronic_load: "Carga Crônica",
      ratio: "Razão ACWR",
      exame_clinico_done: "Exame Clínico Realizado",
      exame_clinico_notes: "Observações do Exame Clínico",
      rx_panoramico_done: "Rx Panorâmico Realizado",
      rx_interproximal_done: "Rx Interproximal Realizado",
      rx_findings: "Achados Radiográficos",
      exames_complementares: "Exames Complementares",
      coping_acsi28: "Coping — ACSI-28 (0\u2013100)",
      motivacao: "Motivação (1\u20135)",
      csai2r_cognitive: "Ansiedade Cognitiva — CSAI-2R",
      csai2r_somatic: "Ansiedade Somática — CSAI-2R",
      csai2r_self_confidence: "Autoconfiança — CSAI-2R",
      brums_vigor: "Vigor — BRUMS (0\u20134)",
      brums_tension: "Tensão — BRUMS (0\u20134)",
      brums_depression: "Depressão — BRUMS (0\u20134)",
      brums_anger: "Raiva — BRUMS (0\u20134)",
      brums_fatigue: "Fadiga — BRUMS (0\u20134)",
      brums_confusion: "Confusão — BRUMS (0\u20134)",
      group_integration_score: "Integração ao Grupo",
      psychological_load: "Carga Psicológica",
      cognitive_skills_notes: "Habilidades Cognitivas",
    },
    psychologicalLoad: {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
    },
    yoyoType: {
      IR1: "IR1",
      IR2: "IR2",
    },
    notesLabel: "Observações Gerais",
    notesPlaceholder: "Adicione observações gerais ou comentários...",
  },
  ```

- [ ] **Step 3: Add emitValidation keys to `src/locales/ja.ts`**

  Append the same block with Japanese translations:

  ```typescript
  emitValidation: {
    title: "評価を発行",
    emitButton: "評価を発行",
    step: "ステップ {{current}} / {{total}}",
    next: "次へ",
    previous: "前へ",
    submit: "送信",
    submitting: "送信中...",
    submitSuccess: "評価を送信しました",
    submitError: "評価を送信できませんでした",
    skipHint: "すべての項目は任意です",
    steps: {
      antropometria: "身体計測",
      bioimpedancia: "体組成（生体インピーダンス）",
      dinamometria: "握力測定",
      bioquimica: "生化学検査",
      vo2max: "有酸素能力（VO\u2082max）",
      yoyo_test: "Yo-Yoテスト",
      shuttle_run_20m: "シャトルラン 20m",
      wingate: "ウィンゲートテスト",
      rast: "RAST",
      forca_potencia: "筋力・パワー",
      velocidade_aceleracao: "スピード・加速",
      agilidade: "アジリティ",
      resistencia_muscular: "筋持久力",
      flexibilidade: "柔軟性",
      acwr: "トレーニング負荷（ACWR）",
      odontologia: "スポーツ歯科",
      psicologia: "スポーツ心理",
      notes: "総合所見",
    },
    fields: {
      height_cm: "身長 (cm)",
      weight_kg: "体重 (kg)",
      bmi: "BMI",
      wingspan_cm: "腕長 (cm)",
      body_fat_pct: "体脂肪率 (%)",
      lean_mass_kg: "除脂肪体重 (kg)",
      visceral_fat: "内臓脂肪",
      muscle_mass_kg: "筋肉量 (kg)",
      hydration_pct: "水分率 (%)",
      basal_metabolic_rate: "基礎代謝 (kcal)",
      grip_left_kg: "左握力 (kg)",
      grip_right_kg: "右握力 (kg)",
      ast: "AST (U/L)",
      alt: "ALT (U/L)",
      urea: "尿素 (mg/dL)",
      creatinine: "クレアチニン (mg/dL)",
      glucose: "血糖 (mg/dL)",
      hba1c: "HbA1c (%)",
      total_cholesterol: "総コレステロール (mg/dL)",
      ldl: "LDL (mg/dL)",
      hdl: "HDL (mg/dL)",
      tg: "中性脂肪 (mg/dL)",
      total_protein: "総タンパク (g/dL)",
      albumin: "アルブミン (g/dL)",
      vo2max_ml_kg_min: "VO\u2082max (mL/kg/min)",
      max_hr_bpm: "最大心拍数 (bpm)",
      protocol: "プロトコル",
      yoyo_type: "種類",
      distance_m: "距離 (m)",
      level: "レベル",
      speed_km_h: "速度 (km/h)",
      time_s: "タイム (s)",
      shuttles: "シャトル数",
      peak_power_w: "ピークパワー (W)",
      mean_power_w: "平均パワー (W)",
      fatigue_index_pct: "疲労指数 (%)",
      best_sprint_s: "最速スプリント (s)",
      squat_jump_cm: "スクワットジャンプ (cm)",
      cmj_cm: "CMJ (cm)",
      horizontal_jump_cm: "立ち幅跳び (cm)",
      sprint_10m_s: "10m走 (s)",
      sprint_20m_s: "20m走 (s)",
      sprint_30m_s: "30m走 (s)",
      sprint_40m_s: "40m走 (s)",
      test_name: "テスト名",
      score: "スコア",
      abdominal_reps: "腹筋 (回)",
      canguru_reps: "カンガルー (回)",
      sit_and_reach_cm: "長座体前屈 (cm)",
      acute_load: "急性負荷",
      chronic_load: "慢性負荷",
      ratio: "ACWR比",
      exame_clinico_done: "臨床検査実施",
      exame_clinico_notes: "臨床検査メモ",
      rx_panoramico_done: "パノラマX線実施",
      rx_interproximal_done: "咬翼法X線実施",
      rx_findings: "X線所見",
      exames_complementares: "追加検査",
      coping_acsi28: "コーピング — ACSI-28 (0\u2013100)",
      motivacao: "モチベーション (1\u20135)",
      csai2r_cognitive: "認知不安 — CSAI-2R",
      csai2r_somatic: "身体不安 — CSAI-2R",
      csai2r_self_confidence: "自信 — CSAI-2R",
      brums_vigor: "活気 — BRUMS (0\u20134)",
      brums_tension: "緊張 — BRUMS (0\u20134)",
      brums_depression: "抑うつ — BRUMS (0\u20134)",
      brums_anger: "怒り — BRUMS (0\u20134)",
      brums_fatigue: "疲労 — BRUMS (0\u20134)",
      brums_confusion: "混乱 — BRUMS (0\u20134)",
      group_integration_score: "グループ統合スコア",
      psychological_load: "心理的負荷",
      cognitive_skills_notes: "認知スキルメモ",
    },
    psychologicalLoad: {
      low: "低",
      medium: "中",
      high: "高",
    },
    yoyoType: {
      IR1: "IR1",
      IR2: "IR2",
    },
    notesLabel: "総合所見",
    notesPlaceholder: "総合的な所見やコメントを入力してください...",
  },
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add src/locales/en.ts src/locales/pt-br.ts src/locales/ja.ts
  git commit -m "feat(i18n): add emitValidation keys for all locales"
  ```

---

## Task 3: Create src/processes/validation.ts

**Files:**
- Create: `src/processes/validation.ts`

- [ ] **Step 1: Create the file**

  ```typescript
  import { supabase } from "@/config/supabase";
  import type { ValidationChecklist } from "@/processes/types/profileTypes";

  export const submitValidation = async (params: {
    athleteUserId: string;
    professionalUserId: string;
    checklist: ValidationChecklist;
    note: string;
  }): Promise<void> => {
    const { athleteUserId, professionalUserId, checklist, note } = params;

    const { error } = await supabase.from("validation").insert({
      athlete_user_id: athleteUserId,
      professional_user_id: professionalUserId,
      professional_role: "pro",
      checklist,
      note: note.trim() || null,
      status: "pending",
    });

    if (error) throw error;
  };
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/processes/validation.ts
  git commit -m "feat(processes): add submitValidation API function"
  ```

---

## Task 4: Register emit-validation modal in _layout.tsx

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Add the Stack.Screen entry**

  After the `user-feed` Stack.Screen entry (around line 153), add:

  ```typescript
  <Stack.Screen
    name="emit-validation"
    options={{
      headerShown: false,
      presentation: "fullScreenModal",
    }}
  />
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/app/_layout.tsx
  git commit -m "feat(routing): register emit-validation as fullScreenModal"
  ```

---

## Task 5: Update VisitorProfile to show emit button for pro users

**Files:**
- Modify: `src/Views/VisitorProfile/VisitorProfile.types.ts`
- Modify: `src/Views/VisitorProfile/useVisitorProfile.ts`
- Modify: `src/Views/VisitorProfile/VisitorProfile.tsx`
- Modify: `src/Views/VisitorProfile/VisitorProfile.styles.ts`

- [ ] **Step 1: Update VisitorProfile.types.ts — add viewerRole and handleEmitValidation**

  Replace the existing content of `src/Views/VisitorProfile/VisitorProfile.types.ts`:

  ```typescript
  import {
    AthleteProfileHeader,
    ProfileVideo,
    UserRole,
  } from "@/processes/types/profileTypes";

  export interface VisitorProfileProps {
    userId: string;
    username: string | null;
    viewerRole?: UserRole | null;
  }

  export interface UseVisitorProfileReturn {
    profileData: AthleteProfileHeader | null;
    videos: ProfileVideo[];
    isLoading: boolean;
    isError: boolean;
    handleVideoPress: (item: ProfileVideo) => void;
    handleEmitValidation: () => void;
  }
  ```

- [ ] **Step 2: Update useVisitorProfile.ts — add handleEmitValidation**

  Replace the existing content of `src/Views/VisitorProfile/useVisitorProfile.ts`:

  ```typescript
  import {
    fetchAthleteProfile,
    fetchProfileVideos,
  } from "@/processes/profile";
  import { fetchUserVideoFeed } from "@/processes/feed";
  import { ProfileVideo } from "@/processes/types/profileTypes";
  import { useQuery, useQueryClient } from "@tanstack/react-query";
  import { router, useFocusEffect } from "expo-router";
  import { useCallback } from "react";
  import { UseVisitorProfileReturn } from "./VisitorProfile.types";

  const VISITOR_PROFILE_STALE = 2 * 60 * 1000;
  const VISITOR_PROFILE_GC = 5 * 60 * 1000;

  export const useVisitorProfile = (
    userId: string,
    username: string | null
  ): UseVisitorProfileReturn => {
    const queryClient = useQueryClient();

    useFocusEffect(
      useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["visitor-profile", userId] });
        queryClient.invalidateQueries({ queryKey: ["visitor-profile-videos", userId] });
      }, [userId, queryClient])
    );

    const {
      data: profileData,
      isLoading: isProfileLoading,
      isError: isProfileError,
    } = useQuery({
      queryKey: ["visitor-profile", userId],
      queryFn: () => fetchAthleteProfile(userId),
      enabled: !!userId,
      staleTime: VISITOR_PROFILE_STALE,
      gcTime: VISITOR_PROFILE_GC,
    });

    const { data: videosData } = useQuery({
      queryKey: ["visitor-profile-videos", userId],
      queryFn: () => fetchProfileVideos(userId),
      enabled: !!userId,
      staleTime: VISITOR_PROFILE_STALE,
      gcTime: VISITOR_PROFILE_GC,
    });

    useQuery({
      queryKey: ["user-feed-videos", userId],
      queryFn: () => fetchUserVideoFeed(userId),
      enabled: !!userId,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });

    const videos = videosData ?? [];

    const handleVideoPress = useCallback(
      (item: ProfileVideo) => {
        const index = videos.findIndex((v) => v.id === item.id);
        router.push(
          `/user-feed?userId=${userId}&username=${encodeURIComponent(username ?? "")}&initialIndex=${Math.max(index, 0)}` as any
        );
      },
      [videos, userId, username]
    );

    const handleEmitValidation = useCallback(() => {
      const name = encodeURIComponent(profileData?.name ?? "");
      router.push(`/emit-validation?athleteId=${userId}&athleteName=${name}` as any);
    }, [userId, profileData?.name]);

    return {
      profileData: profileData ?? null,
      videos,
      isLoading: isProfileLoading,
      isError: isProfileError,
      handleVideoPress,
      handleEmitValidation,
    };
  };
  ```

- [ ] **Step 3: Add emitButtonContainer style to VisitorProfile.styles.ts**

  Read the existing styles file first. The file currently ends after the `errorContainer` style. Add `emitButtonContainer` to the StyleSheet:

  ```typescript
  emitButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    backgroundColor: Brand.bg,
  },
  ```

- [ ] **Step 4: Update VisitorProfile.tsx — accept viewerRole, show emit button**

  Replace the existing content of `src/Views/VisitorProfile/VisitorProfile.tsx`:

  ```typescript
  import { ProfileHeader } from "@/components/ProfileHeader";
  import { VideosSection } from "@/components/VideosSection";
  import { Brand } from "@/constants/theme";
  import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
  import { useTranslation } from "react-i18next";
  import { ScrollView } from "react-native";
  import { styles } from "./VisitorProfile.styles";
  import { VisitorProfileProps } from "./VisitorProfile.types";
  import { useVisitorProfile } from "./useVisitorProfile";

  const VisitorProfile = ({ userId, username, viewerRole }: VisitorProfileProps) => {
    const { profileData, videos, isLoading, isError, handleVideoPress, handleEmitValidation } =
      useVisitorProfile(userId, username);
    const { t } = useTranslation();

    if (isLoading) {
      return (
        <Layout style={[styles.loadingContainer, { backgroundColor: Brand.bg }]}>
          <Spinner size="large" />
        </Layout>
      );
    }

    if (isError || !profileData) {
      return (
        <Layout style={[styles.errorContainer, { backgroundColor: Brand.bg }]}>
          <Text category="s1">{t("common.retry")}</Text>
        </Layout>
      );
    }

    return (
      <Layout style={[styles.container, { backgroundColor: Brand.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileHeader
            profile={profileData}
            isOwnProfile={false}
            viewerRole={viewerRole ?? "athlete"}
          />
          <VideosSection
            videos={videos}
            isOwnProfile={false}
            onVideoPress={handleVideoPress}
          />
        </ScrollView>
        {viewerRole === "pro" && (
          <Layout style={[styles.emitButtonContainer, { backgroundColor: Brand.bg }]}>
            <Button
              status="success"
              style={{ borderRadius: 24, borderWidth: 0 }}
              onPress={handleEmitValidation}
            >
              {t("emitValidation.emitButton")}
            </Button>
          </Layout>
        )}
      </Layout>
    );
  };

  export default VisitorProfile;
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add src/Views/VisitorProfile/
  git commit -m "feat(VisitorProfile): show emit validation button for pro viewers"
  ```

---

## Task 6: Update visitor-profile.tsx to pass viewerRole

**Files:**
- Modify: `src/app/visitor-profile.tsx`

- [ ] **Step 1: Pass viewerRole from auth store**

  Replace the existing content of `src/app/visitor-profile.tsx`:

  ```typescript
  import { HeaderBar } from "@/components/HeaderBar";
  import { VisitorProfile } from "@/Views/VisitorProfile";
  import { Brand } from "@/constants/theme";
  import { useAuthStore } from "@/stores/authStore";
  import { router, useLocalSearchParams } from "expo-router";
  import { View, StyleSheet } from "react-native";

  export default function VisitorProfileScreen() {
    const { userId, username, name } = useLocalSearchParams<{
      userId: string;
      username: string;
      name: string;
    }>();

    const role = useAuthStore((state) => state.role);
    const headerTitle = username ? `@${username}` : (name ?? "");

    return (
      <View style={styles.container}>
        <HeaderBar
          title={headerTitle}
          leftIcon="arrow-back-outline"
          onLeftPress={() => router.back()}
        />
        <VisitorProfile
          userId={userId ?? ""}
          username={username ?? null}
          viewerRole={role}
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Brand.bg,
    },
  });
  ```

- [ ] **Step 2: Verify manually**

  Run the app (`bun start`), log in as a `pro` account, navigate to any athlete profile via Search. Confirm the "Emitir validação" / "Issue Validation" green button appears at the bottom. Log in as an `athlete` account — confirm the button does NOT appear.

- [ ] **Step 3: Commit**

  ```bash
  git add src/app/visitor-profile.tsx
  git commit -m "feat(visitor-profile): pass viewerRole to VisitorProfile"
  ```

---

## Task 7: Create EmitValidation types and styles

**Files:**
- Create: `src/Views/EmitValidation/EmitValidation.types.ts`
- Create: `src/Views/EmitValidation/EmitValidation.styles.ts`

- [ ] **Step 1: Create EmitValidation.types.ts**

  ```typescript
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
  ```

- [ ] **Step 2: Create EmitValidation.styles.ts**

  ```typescript
  import { Brand } from "@/constants/theme";
  import { StyleSheet } from "react-native";

  export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Brand.bg,
    },
    progressBarTrack: {
      height: 3,
      backgroundColor: Brand.border,
    },
    progressBarFill: {
      height: 3,
      backgroundColor: Brand.green,
    },
    stepHeader: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 8,
    },
    stepCounter: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      color: Brand.gray,
      marginBottom: 4,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Brand.white,
    },
    skipHint: {
      fontSize: 12,
      color: Brand.gray,
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    footer: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: Brand.border,
      backgroundColor: Brand.bg,
    },
    footerButton: {
      flex: 1,
      borderRadius: 24,
      borderWidth: 0,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      color: Brand.gray,
      marginBottom: 6,
      marginTop: 14,
    },
    textInput: {
      borderWidth: 1,
      borderColor: Brand.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: Brand.white,
      fontSize: 15,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Brand.border,
    },
    checkboxLabel: {
      fontSize: 14,
      color: Brand.white,
      flex: 1,
    },
    segmentRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
    },
    segmentOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Brand.border,
      alignItems: "center",
    },
    segmentOptionActive: {
      borderColor: Brand.green,
      backgroundColor: `${Brand.green}22`,
    },
    segmentOptionText: {
      fontSize: 14,
      fontWeight: "600",
      color: Brand.gray,
    },
    segmentOptionTextActive: {
      color: Brand.green,
    },
    notesInput: {
      borderWidth: 1,
      borderColor: Brand.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: Brand.white,
      fontSize: 15,
      minHeight: 160,
      textAlignVertical: "top",
    },
  });
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/Views/EmitValidation/EmitValidation.types.ts src/Views/EmitValidation/EmitValidation.styles.ts
  git commit -m "feat(EmitValidation): add types and styles"
  ```

---

## Task 8: Create StepField shared component

**Files:**
- Create: `src/Views/EmitValidation/steps/StepField.tsx`

- [ ] **Step 1: Create StepField.tsx**

  ```typescript
  import { Brand } from "@/constants/theme";
  import { Text } from "@ui-kitten/components";
  import { useState } from "react";
  import { Switch, TextInput, TouchableOpacity, View } from "react-native";
  import { styles } from "../EmitValidation.styles";

  /** Labeled numeric input. Passes undefined to onChangeNumber when empty. */
  export const StepNumericField = ({
    label,
    value,
    onChangeNumber,
  }: {
    label: string;
    value: number | undefined;
    onChangeNumber: (v: number | undefined) => void;
  }) => {
    const [text, setText] = useState(value !== undefined ? String(value) : "");
    return (
      <>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={(v) => {
            setText(v);
            const parsed = parseFloat(v);
            onChangeNumber(v === "" || isNaN(parsed) ? undefined : parsed);
          }}
          keyboardType="numeric"
          placeholder="—"
          placeholderTextColor={Brand.gray}
        />
      </>
    );
  };

  /** Labeled free-text input. */
  export const StepTextField = ({
    label,
    value,
    onChangeText,
    multiline = false,
  }: {
    label: string;
    value: string | undefined;
    onChangeText: (v: string) => void;
    multiline?: boolean;
  }) => (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={multiline ? styles.notesInput : styles.textInput}
        value={value ?? ""}
        onChangeText={onChangeText}
        placeholder="—"
        placeholderTextColor={Brand.gray}
        multiline={multiline}
      />
    </>
  );

  /** Labeled boolean toggle row. */
  export const StepCheckboxField = ({
    label,
    value,
    onToggle,
  }: {
    label: string;
    value: boolean | undefined;
    onToggle: (v: boolean) => void;
  }) => (
    <View style={styles.checkboxRow}>
      <Text style={styles.checkboxLabel}>{label}</Text>
      <Switch
        value={value ?? false}
        onValueChange={onToggle}
        trackColor={{ true: Brand.green, false: Brand.border }}
        thumbColor={Brand.white}
      />
    </View>
  );

  /** Labeled segmented control for a fixed set of string options. */
  export const StepSelectField = <T extends string>({
    label,
    value,
    options,
    onSelect,
  }: {
    label: string;
    value: T | undefined;
    options: { key: T; label: string }[];
    onSelect: (v: T) => void;
  }) => (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.segmentOption,
              value === opt.key && styles.segmentOptionActive,
            ]}
            onPress={() => onSelect(opt.key)}
          >
            <Text
              style={[
                styles.segmentOptionText,
                value === opt.key && styles.segmentOptionTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/Views/EmitValidation/steps/StepField.tsx
  git commit -m "feat(EmitValidation): add StepField shared field components"
  ```

---

## Task 9: Create step components — Antropometria through RAST (steps 0–8)

**Files:**
- Create: `src/Views/EmitValidation/steps/StepAntropometria.tsx`
- Create: `src/Views/EmitValidation/steps/StepBioimpedancia.tsx`
- Create: `src/Views/EmitValidation/steps/StepDinamometria.tsx`
- Create: `src/Views/EmitValidation/steps/StepBioquimica.tsx`
- Create: `src/Views/EmitValidation/steps/StepVo2max.tsx`
- Create: `src/Views/EmitValidation/steps/StepYoyoTest.tsx`
- Create: `src/Views/EmitValidation/steps/StepShuttleRun20m.tsx`
- Create: `src/Views/EmitValidation/steps/StepWingate.tsx`
- Create: `src/Views/EmitValidation/steps/StepRast.tsx`

- [ ] **Step 1: Create StepAntropometria.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["antropometria"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["antropometria"]>>) => void;
  };

  export const StepAntropometria = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.height_cm")} value={data.height_cm} onChangeNumber={(v) => onUpdate({ height_cm: v })} />
        <StepNumericField label={t("emitValidation.fields.weight_kg")} value={data.weight_kg} onChangeNumber={(v) => onUpdate({ weight_kg: v })} />
        <StepNumericField label={t("emitValidation.fields.bmi")} value={data.bmi} onChangeNumber={(v) => onUpdate({ bmi: v })} />
        <StepNumericField label={t("emitValidation.fields.wingspan_cm")} value={data.wingspan_cm} onChangeNumber={(v) => onUpdate({ wingspan_cm: v })} />
        <StepNumericField label={t("emitValidation.fields.body_fat_pct")} value={data.body_fat_pct} onChangeNumber={(v) => onUpdate({ body_fat_pct: v })} />
        <StepNumericField label={t("emitValidation.fields.lean_mass_kg")} value={data.lean_mass_kg} onChangeNumber={(v) => onUpdate({ lean_mass_kg: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 2: Create StepBioimpedancia.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["bioimpedancia"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["bioimpedancia"]>>) => void;
  };

  export const StepBioimpedancia = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.body_fat_pct")} value={data.body_fat_pct} onChangeNumber={(v) => onUpdate({ body_fat_pct: v })} />
        <StepNumericField label={t("emitValidation.fields.visceral_fat")} value={data.visceral_fat} onChangeNumber={(v) => onUpdate({ visceral_fat: v })} />
        <StepNumericField label={t("emitValidation.fields.muscle_mass_kg")} value={data.muscle_mass_kg} onChangeNumber={(v) => onUpdate({ muscle_mass_kg: v })} />
        <StepNumericField label={t("emitValidation.fields.hydration_pct")} value={data.hydration_pct} onChangeNumber={(v) => onUpdate({ hydration_pct: v })} />
        <StepNumericField label={t("emitValidation.fields.basal_metabolic_rate")} value={data.basal_metabolic_rate} onChangeNumber={(v) => onUpdate({ basal_metabolic_rate: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 3: Create StepDinamometria.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["dinamometria"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["dinamometria"]>>) => void;
  };

  export const StepDinamometria = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.grip_left_kg")} value={data.grip_left_kg} onChangeNumber={(v) => onUpdate({ grip_left_kg: v })} />
        <StepNumericField label={t("emitValidation.fields.grip_right_kg")} value={data.grip_right_kg} onChangeNumber={(v) => onUpdate({ grip_right_kg: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 4: Create StepBioquimica.tsx**

  ```typescript
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
  ```

- [ ] **Step 5: Create StepVo2max.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField, StepTextField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["vo2max"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["vo2max"]>>) => void;
  };

  export const StepVo2max = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.vo2max_ml_kg_min")} value={data.vo2max_ml_kg_min} onChangeNumber={(v) => onUpdate({ vo2max_ml_kg_min: v })} />
        <StepNumericField label={t("emitValidation.fields.max_hr_bpm")} value={data.max_hr_bpm} onChangeNumber={(v) => onUpdate({ max_hr_bpm: v })} />
        <StepTextField label={t("emitValidation.fields.protocol")} value={data.protocol} onChangeText={(v) => onUpdate({ protocol: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 6: Create StepYoyoTest.tsx**

  ```typescript
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
            { key: "IR1", label: t("emitValidation.yoyoType.IR1") },
            { key: "IR2", label: t("emitValidation.yoyoType.IR2") },
          ]}
          onSelect={(v) => onUpdate({ type: v })}
        />
        <StepNumericField label={t("emitValidation.fields.distance_m")} value={data.distance_m} onChangeNumber={(v) => onUpdate({ distance_m: v })} />
        <StepNumericField label={t("emitValidation.fields.level")} value={data.level} onChangeNumber={(v) => onUpdate({ level: v })} />
        <StepNumericField label={t("emitValidation.fields.speed_km_h")} value={data.speed_km_h} onChangeNumber={(v) => onUpdate({ speed_km_h: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 7: Create StepShuttleRun20m.tsx**

  ```typescript
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
  ```

- [ ] **Step 8: Create StepWingate.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["wingate"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["wingate"]>>) => void;
  };

  export const StepWingate = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.peak_power_w")} value={data.peak_power_w} onChangeNumber={(v) => onUpdate({ peak_power_w: v })} />
        <StepNumericField label={t("emitValidation.fields.mean_power_w")} value={data.mean_power_w} onChangeNumber={(v) => onUpdate({ mean_power_w: v })} />
        <StepNumericField label={t("emitValidation.fields.fatigue_index_pct")} value={data.fatigue_index_pct} onChangeNumber={(v) => onUpdate({ fatigue_index_pct: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 9: Create StepRast.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["rast"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["rast"]>>) => void;
  };

  export const StepRast = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.peak_power_w")} value={data.peak_power_w} onChangeNumber={(v) => onUpdate({ peak_power_w: v })} />
        <StepNumericField label={t("emitValidation.fields.mean_power_w")} value={data.mean_power_w} onChangeNumber={(v) => onUpdate({ mean_power_w: v })} />
        <StepNumericField label={t("emitValidation.fields.fatigue_index_pct")} value={data.fatigue_index_pct} onChangeNumber={(v) => onUpdate({ fatigue_index_pct: v })} />
        <StepNumericField label={t("emitValidation.fields.best_sprint_s")} value={data.best_sprint_s} onChangeNumber={(v) => onUpdate({ best_sprint_s: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 10: Commit**

  ```bash
  git add src/Views/EmitValidation/steps/
  git commit -m "feat(EmitValidation): add step components 0-8 (Antropometria through RAST)"
  ```

---

## Task 10: Create step components — ForcaPotencia through Notes (steps 9–17)

**Files:**
- Create: `src/Views/EmitValidation/steps/StepForcaPotencia.tsx`
- Create: `src/Views/EmitValidation/steps/StepVelocidade.tsx`
- Create: `src/Views/EmitValidation/steps/StepAgilidade.tsx`
- Create: `src/Views/EmitValidation/steps/StepResistenciaMuscular.tsx`
- Create: `src/Views/EmitValidation/steps/StepFlexibilidade.tsx`
- Create: `src/Views/EmitValidation/steps/StepAcwr.tsx`
- Create: `src/Views/EmitValidation/steps/StepOdontologia.tsx`
- Create: `src/Views/EmitValidation/steps/StepPsicologia.tsx`
- Create: `src/Views/EmitValidation/steps/StepNotes.tsx`

- [ ] **Step 1: Create StepForcaPotencia.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["forca_potencia"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["forca_potencia"]>>) => void;
  };

  export const StepForcaPotencia = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.squat_jump_cm")} value={data.squat_jump_cm} onChangeNumber={(v) => onUpdate({ squat_jump_cm: v })} />
        <StepNumericField label={t("emitValidation.fields.cmj_cm")} value={data.cmj_cm} onChangeNumber={(v) => onUpdate({ cmj_cm: v })} />
        <StepNumericField label={t("emitValidation.fields.horizontal_jump_cm")} value={data.horizontal_jump_cm} onChangeNumber={(v) => onUpdate({ horizontal_jump_cm: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 2: Create StepVelocidade.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["velocidade_aceleracao"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["velocidade_aceleracao"]>>) => void;
  };

  export const StepVelocidade = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.sprint_10m_s")} value={data.sprint_10m_s} onChangeNumber={(v) => onUpdate({ sprint_10m_s: v })} />
        <StepNumericField label={t("emitValidation.fields.sprint_20m_s")} value={data.sprint_20m_s} onChangeNumber={(v) => onUpdate({ sprint_20m_s: v })} />
        <StepNumericField label={t("emitValidation.fields.sprint_30m_s")} value={data.sprint_30m_s} onChangeNumber={(v) => onUpdate({ sprint_30m_s: v })} />
        <StepNumericField label={t("emitValidation.fields.sprint_40m_s")} value={data.sprint_40m_s} onChangeNumber={(v) => onUpdate({ sprint_40m_s: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 3: Create StepAgilidade.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField, StepTextField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["agilidade"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["agilidade"]>>) => void;
  };

  export const StepAgilidade = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepTextField label={t("emitValidation.fields.test_name")} value={data.test_name} onChangeText={(v) => onUpdate({ test_name: v })} />
        <StepNumericField label={t("emitValidation.fields.time_s")} value={data.time_s} onChangeNumber={(v) => onUpdate({ time_s: v })} />
        <StepNumericField label={t("emitValidation.fields.score")} value={data.score} onChangeNumber={(v) => onUpdate({ score: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 4: Create StepResistenciaMuscular.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["resistencia_muscular"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["resistencia_muscular"]>>) => void;
  };

  export const StepResistenciaMuscular = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.abdominal_reps")} value={data.abdominal_reps} onChangeNumber={(v) => onUpdate({ abdominal_reps: v })} />
        <StepNumericField label={t("emitValidation.fields.canguru_reps")} value={data.canguru_reps} onChangeNumber={(v) => onUpdate({ canguru_reps: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 5: Create StepFlexibilidade.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["flexibilidade"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["flexibilidade"]>>) => void;
  };

  export const StepFlexibilidade = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.sit_and_reach_cm")} value={data.sit_and_reach_cm} onChangeNumber={(v) => onUpdate({ sit_and_reach_cm: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 6: Create StepAcwr.tsx**

  ```typescript
  import { ValidationChecklist } from "@/processes/types/profileTypes";
  import { useTranslation } from "react-i18next";
  import { View } from "react-native";
  import { StepNumericField } from "./StepField";

  type Props = {
    data: NonNullable<ValidationChecklist["acwr"]>;
    onUpdate: (patch: Partial<NonNullable<ValidationChecklist["acwr"]>>) => void;
  };

  export const StepAcwr = ({ data, onUpdate }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <StepNumericField label={t("emitValidation.fields.acute_load")} value={data.acute_load} onChangeNumber={(v) => onUpdate({ acute_load: v })} />
        <StepNumericField label={t("emitValidation.fields.chronic_load")} value={data.chronic_load} onChangeNumber={(v) => onUpdate({ chronic_load: v })} />
        <StepNumericField label={t("emitValidation.fields.ratio")} value={data.ratio} onChangeNumber={(v) => onUpdate({ ratio: v })} />
      </View>
    );
  };
  ```

- [ ] **Step 7: Create StepOdontologia.tsx**

  ```typescript
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
  ```

- [ ] **Step 8: Create StepPsicologia.tsx**

  ```typescript
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
            { key: "low", label: t("emitValidation.psychologicalLoad.low") },
            { key: "medium", label: t("emitValidation.psychologicalLoad.medium") },
            { key: "high", label: t("emitValidation.psychologicalLoad.high") },
          ]}
          onSelect={(v) => onUpdate({ psychological_load: v })}
        />
        <StepTextField label={t("emitValidation.fields.cognitive_skills_notes")} value={data.cognitive_skills_notes} onChangeText={(v) => onUpdate({ cognitive_skills_notes: v })} multiline />
      </View>
    );
  };
  ```

- [ ] **Step 9: Create StepNotes.tsx**

  ```typescript
  import { Brand } from "@/constants/theme";
  import { Text } from "@ui-kitten/components";
  import { useTranslation } from "react-i18next";
  import { TextInput, View } from "react-native";
  import { styles } from "../EmitValidation.styles";

  type Props = {
    note: string;
    onChangeNote: (note: string) => void;
  };

  export const StepNotes = ({ note, onChangeNote }: Props) => {
    const { t } = useTranslation();
    return (
      <View>
        <Text style={styles.fieldLabel}>{t("emitValidation.notesLabel")}</Text>
        <TextInput
          style={styles.notesInput}
          value={note}
          onChangeText={onChangeNote}
          placeholder={t("emitValidation.notesPlaceholder")}
          placeholderTextColor={Brand.gray}
          multiline
        />
      </View>
    );
  };
  ```

- [ ] **Step 10: Commit**

  ```bash
  git add src/Views/EmitValidation/steps/
  git commit -m "feat(EmitValidation): add step components 9-17 (ForcaPotencia through Notes)"
  ```

---

## Task 11: Create useEmitValidation hook

**Files:**
- Create: `src/Views/EmitValidation/useEmitValidation.ts`

- [ ] **Step 1: Create the file**

  ```typescript
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
        await queryClient.invalidateQueries({ queryKey: ["pro-profile"] });
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/Views/EmitValidation/useEmitValidation.ts
  git commit -m "feat(EmitValidation): add useEmitValidation hook"
  ```

---

## Task 12: Create EmitValidation.tsx, index.ts, and route screen

**Files:**
- Create: `src/Views/EmitValidation/EmitValidation.tsx`
- Create: `src/Views/EmitValidation/index.ts`
- Create: `src/app/emit-validation.tsx`

- [ ] **Step 1: Create EmitValidation.tsx**

  ```typescript
  import { HeaderBar } from "@/components/HeaderBar";
  import { Brand } from "@/constants/theme";
  import { Button, Layout, Text } from "@ui-kitten/components";
  import { router, useLocalSearchParams } from "expo-router";
  import { useTranslation } from "react-i18next";
  import { ScrollView, View } from "react-native";
  import { styles } from "./EmitValidation.styles";
  import { useEmitValidation } from "./useEmitValidation";
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

  const EmitValidation = () => {
    const { t } = useTranslation();
    const { athleteName } = useLocalSearchParams<{ athleteName: string }>();
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

    const isLastStep = currentStep === totalSteps - 1;
    const progressWidth = `${((currentStep + 1) / totalSteps) * 100}%`;

    const renderStep = () => {
      switch (stepKey) {
        case "antropometria":
          return <StepAntropometria data={checklist.antropometria ?? {}} onUpdate={(p) => updateCategory("antropometria", p)} />;
        case "bioimpedancia":
          return <StepBioimpedancia data={checklist.bioimpedancia ?? {}} onUpdate={(p) => updateCategory("bioimpedancia", p)} />;
        case "dinamometria":
          return <StepDinamometria data={checklist.dinamometria ?? {}} onUpdate={(p) => updateCategory("dinamometria", p)} />;
        case "bioquimica":
          return <StepBioquimica data={checklist.bioquimica ?? {}} onUpdate={(p) => updateCategory("bioquimica", p)} />;
        case "vo2max":
          return <StepVo2max data={checklist.vo2max ?? {}} onUpdate={(p) => updateCategory("vo2max", p)} />;
        case "yoyo_test":
          return <StepYoyoTest data={checklist.yoyo_test ?? {}} onUpdate={(p) => updateCategory("yoyo_test", p)} />;
        case "shuttle_run_20m":
          return <StepShuttleRun20m data={checklist.shuttle_run_20m ?? {}} onUpdate={(p) => updateCategory("shuttle_run_20m", p)} />;
        case "wingate":
          return <StepWingate data={checklist.wingate ?? {}} onUpdate={(p) => updateCategory("wingate", p)} />;
        case "rast":
          return <StepRast data={checklist.rast ?? {}} onUpdate={(p) => updateCategory("rast", p)} />;
        case "forca_potencia":
          return <StepForcaPotencia data={checklist.forca_potencia ?? {}} onUpdate={(p) => updateCategory("forca_potencia", p)} />;
        case "velocidade_aceleracao":
          return <StepVelocidade data={checklist.velocidade_aceleracao ?? {}} onUpdate={(p) => updateCategory("velocidade_aceleracao", p)} />;
        case "agilidade":
          return <StepAgilidade data={checklist.agilidade ?? {}} onUpdate={(p) => updateCategory("agilidade", p)} />;
        case "resistencia_muscular":
          return <StepResistenciaMuscular data={checklist.resistencia_muscular ?? {}} onUpdate={(p) => updateCategory("resistencia_muscular", p)} />;
        case "flexibilidade":
          return <StepFlexibilidade data={checklist.flexibilidade ?? {}} onUpdate={(p) => updateCategory("flexibilidade", p)} />;
        case "acwr":
          return <StepAcwr data={checklist.acwr ?? {}} onUpdate={(p) => updateCategory("acwr", p)} />;
        case "odontologia":
          return <StepOdontologia data={checklist.odontologia ?? {}} onUpdate={(p) => updateCategory("odontologia", p)} />;
        case "psicologia":
          return <StepPsicologia data={checklist.psicologia ?? {}} onUpdate={(p) => updateCategory("psicologia", p)} />;
        case "notes":
          return <StepNotes note={note} onChangeNote={setNote} />;
        default:
          return null;
      }
    };

    return (
      <Layout style={styles.container}>
        <HeaderBar
          title={decodeURIComponent(athleteName ?? "")}
          leftIcon="arrow-back-outline"
          onLeftPress={() => router.back()}
        />
        {/* Progress bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: progressWidth as any }]} />
        </View>

        <View style={styles.stepHeader}>
          <Text style={styles.stepCounter}>
            {t("emitValidation.step", { current: currentStep + 1, total: totalSteps })}
          </Text>
          <Text style={styles.stepTitle}>
            {t(`emitValidation.steps.${stepKey}`)}
          </Text>
        </View>

        <Text style={styles.skipHint}>{t("emitValidation.skipHint")}</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 0 && (
            <Button
              appearance="outline"
              status="basic"
              style={styles.footerButton}
              onPress={goPrevious}
              disabled={isSubmitting}
            >
              {t("emitValidation.previous")}
            </Button>
          )}
          {isLastStep ? (
            <Button
              status="success"
              style={styles.footerButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("emitValidation.submitting") : t("emitValidation.submit")}
            </Button>
          ) : (
            <Button
              status="success"
              style={styles.footerButton}
              onPress={goNext}
            >
              {t("emitValidation.next")}
            </Button>
          )}
        </View>
      </Layout>
    );
  };

  export default EmitValidation;
  ```

- [ ] **Step 2: Create index.ts**

  ```typescript
  export { default as EmitValidation } from "./EmitValidation";
  ```

- [ ] **Step 3: Create src/app/emit-validation.tsx**

  ```typescript
  import { EmitValidation } from "@/Views/EmitValidation";

  export default function EmitValidationScreen() {
    return <EmitValidation />;
  }
  ```

- [ ] **Step 4: Verify manually end-to-end**

  1. Run `bun start` and open the app as a `pro` user.
  2. Navigate to an athlete profile via Search → confirm "Emitir validação" button appears.
  3. Tap the button → confirm the modal opens with the step header, progress bar, and first step (Anthropometry fields).
  4. Fill in a few numeric values, tap "Next" → confirm step advances and progress bar grows.
  5. Navigate through all 18 steps using "Next" and "Previous" → confirm no crashes.
  6. On the last step (Notes), type some text, tap "Submit" → confirm success toast appears and modal closes.
  7. Open your pro profile → confirm the new validation appears in the "Recent Validations" section.
  8. In Supabase dashboard → `validation` table → confirm the row was inserted with `status: pending`, correct `athlete_user_id` and `professional_user_id`, and `checklist` JSONB containing the fields you entered.

- [ ] **Step 5: Commit**

  ```bash
  git add src/Views/EmitValidation/ src/app/emit-validation.tsx
  git commit -m "feat(EmitValidation): add wizard component, index, and route screen"
  ```
