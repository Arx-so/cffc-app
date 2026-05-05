/** Keys matching `editProfile.*` translations. Stored values match the Portuguese literals below (DB payload). */

export const ATHLETE_AVAILABILITY_KEYS = [
  "availabilityLookingForClub",
  "availabilityNegotiating",
  "availabilityContracted",
  "availabilityFreeAgent",
] as const;

export type AthleteAvailabilityTranslationKey =
  (typeof ATHLETE_AVAILABILITY_KEYS)[number];

export const AVAILABILITY_VALUE_BY_TRANSLATION_KEY: Record<
  AthleteAvailabilityTranslationKey,
  string
> = {
  availabilityLookingForClub: "Em busca de clube",
  availabilityNegotiating: "Em negociação",
  availabilityContracted: "Contratado",
  availabilityFreeAgent: "Livre no mercado",
};
