import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Shared styles for all auth/onboarding screens (Welcome, Login, Signup).
export const authStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Brand.bg },
  keyboardAvoid:{ flex: 1, backgroundColor: Brand.bg },
  scrollContent:{ flexGrow: 1, padding: 24, paddingBottom: 48 },

  heroSubtitle: { color: Brand.gray, fontSize: 11, fontWeight: '700', letterSpacing: 2.5, marginBottom: 6 },
  heroTitle:    { color: Brand.white, fontSize: 38, fontWeight: '900', lineHeight: 44, letterSpacing: 0.5 },
  heroTitleGreen: { color: Brand.green },

  fieldLabel: { color: Brand.gray, fontSize: 11, fontWeight: '700', letterSpacing: 1.8, marginBottom: 8, marginTop: 20 },

  input:      { backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, color: Brand.white, fontSize: 15 },
  inputError: { borderColor: Brand.error },
  errorText:  { color: Brand.error, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 5 },

  submitButton:         { backgroundColor: Brand.green, borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 32 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText:     { color: '#000000', fontSize: 16, fontWeight: '800', letterSpacing: 2.5 },

  bottomLink:      { alignItems: 'center', marginTop: 20 },
  bottomLinkText:  { color: Brand.gray, fontSize: 13 },
  bottomLinkBold:  { color: Brand.white, fontWeight: '800', letterSpacing: 0.5 },
});
