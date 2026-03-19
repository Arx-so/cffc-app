import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Only Welcome-specific styles. Shared auth styles come from @/styles/auth.
export const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Brand.bg, paddingHorizontal: 24, paddingBottom: 48 },
  top:        { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 60 },
  bottom:     { gap: 12 },
  iconWrapper:{ width: 72, height: 72, borderRadius: 20, backgroundColor: Brand.card, alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 1.5, borderColor: Brand.border },
  tagline:    { color: Brand.gray, fontSize: 14, lineHeight: 22, marginTop: 16, maxWidth: 280 },

  dots:     { flexDirection: 'row', marginTop: 32, gap: 8 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.border },
  dotActive:{ backgroundColor: Brand.green, width: 20 },

  primaryButton:    { backgroundColor: Brand.green, borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
  primaryButtonText:{ color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 2.5 },

  secondaryButton:          { borderRadius: 12, paddingVertical: 17, alignItems: 'center', borderWidth: 1.5, borderColor: Brand.border },
  secondaryButtonText:      { color: Brand.white, fontSize: 15, fontWeight: '600', letterSpacing: 1 },
  secondaryButtonHighlight: { color: Brand.green, fontWeight: '800' },
});
