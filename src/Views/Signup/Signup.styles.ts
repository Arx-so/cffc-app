import { StyleSheet } from 'react-native';
import { Brand } from '@/constants/theme';

// Only Signup-specific styles. Shared auth styles come from @/styles/auth.
export const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 52 },
  sectionTitle: {
    color: Brand.green,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginTop: 18,
  },
  expandableHeader: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  expandButtonText: {
    color: Brand.green,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  expandHintText: {
    flex: 1,
    color: Brand.gray,
    fontSize: 11,
    textAlign: "right",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.formInputBg,
    borderWidth: 1,
    borderColor: Brand.formInputBorder,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Brand.formInputText,
    fontSize: 15,
  },
  passwordEyeButton: { paddingHorizontal: 14, paddingVertical: 10 },
  clubDraftInput: { marginTop: 10 },
  clubDraftPeriodRow: { marginTop: 10 },
  inlineRow: { flexDirection: "row", gap: 10 },
  inlineItem: { flex: 1 },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    marginBottom: 2,
  },
  optionButton: {
    backgroundColor: Brand.formControlBg,
    borderWidth: 1,
    borderColor: Brand.formControlBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionButtonSelected: { backgroundColor: Brand.formControlActiveBg, borderColor: Brand.formControlActiveBorder },
  optionButtonText: { color: Brand.formControlText, fontSize: 13, fontWeight: "600" },
  optionButtonTextSelected: { color: Brand.formControlActiveText },
  clubCard: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  clubTitle: { color: Brand.white, fontSize: 13, fontWeight: "700" },
  clubSubtitle: { color: Brand.gray, fontSize: 12, marginTop: 2 },
  secondaryButton: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.green,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  secondaryButtonText: { color: Brand.green, fontSize: 12, fontWeight: "700" },
  toggleRow: {
    marginTop: 2,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Date input with inline calendar icon
  dateRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.formInputBg, borderWidth: 1, borderColor: Brand.formInputBorder, borderRadius: 10 },
  dateInput:{ flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: Brand.formInputText, fontSize: 15 },
  dateIcon: { paddingHorizontal: 14 },

  // Profile type card selector
  profileCard:         { backgroundColor: Brand.formControlBg, borderWidth: 1.5, borderColor: Brand.formControlBorder, borderRadius: 12, paddingVertical: 20, alignItems: 'center', marginBottom: 10 },
  profileCardSelected: { backgroundColor: Brand.formControlActiveBg, borderColor: Brand.formControlActiveBorder, borderWidth: 2 },
  profileCardError: { borderColor: Brand.error, borderWidth: 2 },
  profileCardIcon:     { marginBottom: 6 },
  profileCardLabel:    { color: Brand.formControlText, fontSize: 14, fontWeight: '600' },
  profileCardLabelSelected: { color: Brand.formControlActiveText },

  // Minor protection banner
  minorBanner:    { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 4 },
  minorBannerText:{ color: Brand.green, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginLeft: 8 },

  // Chips (positions / strengths)
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipsGroup: {
    marginBottom: 16,
  },
  chipsGroupLabel: {
    color: Brand.gray,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Brand.formControlBorder,
    backgroundColor: Brand.formControlBg,
  },
  chipActive: {
    borderColor: Brand.formControlActiveBorder,
    backgroundColor: Brand.formControlActiveBg,
  },
  chipText: {
    color: Brand.formControlText,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: Brand.formControlActiveText,
  },

  // Custom checkboxes
  checkboxRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  checkboxBox:       { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: Brand.formControlBorder, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: Brand.formControlBg },
  checkboxBoxChecked:{ backgroundColor: Brand.green, borderColor: Brand.green },
  checkboxLabel:     { color: Brand.gray, fontSize: 13, flex: 1, lineHeight: 19 },
  checkboxLink:      { color: Brand.white, fontWeight: '700' },
});
