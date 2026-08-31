import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Shared styles for all auth/onboarding screens (Welcome, Login, Signup).
export const authStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Brand.bg },
  keyboardAvoid:{ flex: 1, backgroundColor: Brand.bg },
  scrollContent:{ flexGrow: 1, padding: 24, paddingBottom: 48 },

  heroSubtitle: { color: Brand.green, fontSize: 14, fontWeight: '700', letterSpacing: 0, marginBottom: 11, textTransform: 'uppercase' },
  heroTitle:    { color: Brand.white, fontSize: 40, fontWeight: '700', lineHeight: 43, letterSpacing: 0, textTransform: 'uppercase' },
  heroTitleGreen: { color: Brand.green },

  fieldLabel: { color: Brand.gray, fontSize: 12, fontWeight: '600', letterSpacing: 0, marginBottom: 8, marginTop: 20 },

  input:      { backgroundColor: Brand.formInputBg, borderWidth: 1, borderColor: Brand.formInputBorder, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: Brand.formInputText, fontSize: 16 },
  inputError: { borderColor: Brand.error },
  errorText:  { color: Brand.errorBg, fontSize: 12, fontWeight: '600', letterSpacing: 0, marginTop: 5 },
  requiredMark: { color: Brand.errorBg },

  submitButton:         { backgroundColor: Brand.buttonPrimaryBg, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 32 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText:     { color: Brand.buttonPrimaryText, fontSize: 16, fontWeight: '700', letterSpacing: 0 },

  bottomLink:      { alignItems: 'center', marginTop: 20 },
  bottomLinkText:  { color: Brand.gray, fontSize: 13 },
  bottomLinkBold:  { color: Brand.green, fontWeight: '700', letterSpacing: 0 },
});
