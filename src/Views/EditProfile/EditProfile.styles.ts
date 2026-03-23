import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

const AVATAR_SIZE = 100;
const AVATAR_RING_SIZE = AVATAR_SIZE + 10;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  scrollContent: {
    paddingBottom: 64,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Brand.bg,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarRing: {
    width: AVATAR_RING_SIZE,
    height: AVATAR_RING_SIZE,
    borderRadius: AVATAR_RING_SIZE / 2,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Brand.card,
  },
  avatarLoadingOverlay: {
    ...({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
    } as const),
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Brand.green,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLabel: {
    color: Brand.gray,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 10,
  },

  // ── Section header (green left bar) ──
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Brand.green,
    marginRight: 10,
  },
  sectionTitle: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },

  // ── Fields ──
  fieldGroup: {
    paddingHorizontal: 24,
  },
  fieldLabel: {
    color: Brand.gray,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Brand.white,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },

  // ── Toggle buttons (dominant foot) ──
  toggleRow: {
    flexDirection: "row",
    gap: 0,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  toggleButtonFirst: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  toggleButtonLast: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: Brand.white,
    borderColor: Brand.white,
  },
  toggleButtonText: {
    color: Brand.gray,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  toggleButtonTextActive: {
    color: "#000",
  },

  // ── Chips ──
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chipText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
  },
  chipRemove: {
    width: 16,
    height: 16,
  },
  addChipButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.border,
    borderStyle: "dashed",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addChipText: {
    color: Brand.gray,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Strength chips (darker style) ──
  strengthChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  strengthChipText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Select / Dropdown ──
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    color: Brand.white,
    fontSize: 15,
  },
  selectPlaceholder: {
    color: "#444",
  },
  selectIcon: {
    width: 20,
    height: 20,
  },

  // ── Club history ──
  clubCard: {
    backgroundColor: Brand.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Brand.green,
  },
  clubCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  clubName: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: "700",
  },
  clubCategory: {
    color: Brand.gray,
    fontSize: 12,
    marginTop: 2,
  },
  clubDates: {
    color: Brand.gray,
    fontSize: 12,
    marginTop: 6,
  },
  clubDeleteButton: {
    padding: 4,
  },
  addClubButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Brand.border,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  addClubText: {
    color: Brand.gray,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── Club inline form ──
  clubForm: {
    backgroundColor: Brand.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    gap: 12,
  },
  clubFormRow: {
    flexDirection: "row",
    gap: 12,
  },
  clubFormField: {
    flex: 1,
  },
  clubFormLabel: {
    color: Brand.gray,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  clubFormInput: {
    backgroundColor: Brand.bg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.white,
    fontSize: 14,
  },
  clubFormActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 4,
  },
  clubFormCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  clubFormCancelText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.7,
  },
  clubFormConfirmButton: {
    backgroundColor: Brand.green,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  clubFormConfirmText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // ── Toggle switch row ──
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Brand.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchLabel: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  switchSublabel: {
    color: Brand.gray,
    fontSize: 11,
    marginTop: 2,
  },

  // ── Radio buttons ──
  radioGroup: {
    gap: 12,
    marginTop: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Brand.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: Brand.green,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Brand.green,
  },
  radioLabel: {
    color: Brand.white,
    fontSize: 14,
  },

  // ── Modal (for adding positions/strengths) ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: Brand.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: Brand.bg,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Brand.white,
    fontSize: 15,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalCancelText: {
    color: Brand.gray,
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmButton: {
    backgroundColor: Brand.green,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Availability options modal ──
  optionRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionText: {
    color: Brand.white,
    fontSize: 15,
  },
  optionTextActive: {
    color: Brand.green,
    fontWeight: "700",
  },
});
