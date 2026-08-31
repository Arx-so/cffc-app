import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Only ResetPassword-specific styles. Shared auth styles come from @/styles/auth.
export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  description: {
    color: Brand.gray,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Brand.white,
    fontSize: 15,
  },
  passwordEyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hint: {
    color: Brand.gray,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  invalidTitle: {
    color: Brand.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  invalidText: {
    color: Brand.gray,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  invalidButton: {
    backgroundColor: Brand.green,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'stretch',
  },
  invalidButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
});
