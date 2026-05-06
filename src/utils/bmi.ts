/** BMI (kg/m²) from height in centimeters and weight in kilograms. */
export function bmiFromHeightWeightCmKg(
  heightCm: number | undefined,
  weightKg: number | undefined
): number | undefined {
  if (heightCm === undefined || weightKg === undefined) return undefined;
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return undefined;
  if (heightCm <= 0 || weightKg <= 0) return undefined;
  const heightM = heightCm / 100;
  const raw = weightKg / (heightM * heightM);
  return Math.round(raw * 10) / 10;
}
