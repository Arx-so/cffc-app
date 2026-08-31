import {
  ATHLETE_POSITIONS,
  ATHLETE_STRENGTHS,
} from "@/constants/athleteAttributes";

type Translate = (key: string) => string;

const KNOWN_POSITIONS = ATHLETE_POSITIONS as readonly string[];
const KNOWN_STRENGTHS = ATHLETE_STRENGTHS as readonly string[];

export const positionLabel = (t: Translate, value: string): string =>
  KNOWN_POSITIONS.includes(value) ? t(`athlete.positions.${value}`) : value;

export const strengthLabel = (t: Translate, value: string): string =>
  KNOWN_STRENGTHS.includes(value) ? t(`athlete.strengths.${value}`) : value;

export const positionLabels = (t: Translate, values: string[]): string[] =>
  values.map((value) => positionLabel(t, value));

export const strengthLabels = (t: Translate, values: string[]): string[] =>
  values.map((value) => strengthLabel(t, value));
