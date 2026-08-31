import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Only ForgotPassword-specific styles. Shared auth styles come from @/styles/auth.
export const styles = StyleSheet.create({
  description: {
    color: Brand.gray,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  successCard: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
  },
  successTitle: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  successText: {
    color: Brand.gray,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  successEmail: {
    color: Brand.green,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  resendButtonText: {
    color: Brand.green,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
