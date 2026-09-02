// Update these once the legal site (in /legal) is deployed to its final Vercel domain.
const LEGAL_SITE_URL = "https://cffc-legal.vercel.app";

export const LegalUrls = {
  privacyPolicy: `${LEGAL_SITE_URL}/privacy`,
  termsOfUse: `${LEGAL_SITE_URL}/terms`,
  support: `${LEGAL_SITE_URL}/support`,
  deleteAccount: `${LEGAL_SITE_URL}/exclusao-de-conta`,
} as const;
