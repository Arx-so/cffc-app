import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Only Signup-specific styles. Shared auth styles come from @/styles/auth.
export const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 52 },

  // Date input with inline calendar icon
  dateRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.card, borderWidth: 1, borderColor: Brand.border, borderRadius: 10 },
  dateInput:{ flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: Brand.white, fontSize: 15 },
  dateIcon: { paddingHorizontal: 14 },

  // Profile type card selector
  profileCard:         { backgroundColor: Brand.card, borderWidth: 1.5, borderColor: Brand.border, borderRadius: 12, paddingVertical: 20, alignItems: 'center', marginBottom: 10 },
  profileCardSelected: { borderColor: Brand.green, borderWidth: 2 },
  profileCardIcon:     { marginBottom: 6 },
  profileCardLabel:    { color: Brand.gray, fontSize: 14, fontWeight: '600' },
  profileCardLabelSelected: { color: Brand.white },

  // Minor protection banner
  minorBanner:    { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 4 },
  minorBannerText:{ color: Brand.green, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginLeft: 8 },

  // Custom checkboxes
  checkboxRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  checkboxBox:       { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Brand.border, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: Brand.card },
  checkboxBoxChecked:{ backgroundColor: Brand.green, borderColor: Brand.green },
  checkboxLabel:     { color: Brand.gray, fontSize: 13, flex: 1, lineHeight: 19 },
  checkboxLink:      { color: Brand.white, fontWeight: '700' },
});
