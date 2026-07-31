// Update these once the legal site (in /legal) is deployed to its final Vercel domain.
const LEGAL_SITE_URL = "https://cffc-legal.vercel.app";

export const LegalUrls = {
  privacyPolicy: `${LEGAL_SITE_URL}/privacidade`,
  termsOfUse: `${LEGAL_SITE_URL}/termos`,
  support: `${LEGAL_SITE_URL}/suporte`,
  deleteAccount: `${LEGAL_SITE_URL}/exclusao-de-conta`,
} as const;
