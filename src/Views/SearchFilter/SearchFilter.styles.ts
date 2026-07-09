import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Brand.card,
  },
  headerSlot: {
    flex: 1,
  },
  headerSlotCenter: {
    alignItems: "center",
    display: "flex"
  },
  headerSlotRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  headerIconButton: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Section header (green left bar) — igual ao EditProfile ──
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
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 3.5,
  },

  // ── Field group + labels — igual ao EditProfile ──
  fieldGroup: {
    paddingHorizontal: 24,
  },
  fieldLabel: {
    color: Brand.gray,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Brand.formInputBg,
    borderWidth: 1,
    borderColor: Brand.formInputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Brand.formInputText,
    fontSize: 15,
  },

  // ── Chips ──
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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

  // ── Age / Physical rows ──
  ageRow: {
    flexDirection: "row",
    gap: 12,
  },
  ageInputWrapper: {
    flex: 1,
  },

  // ── Dominant foot buttons ──
  footRow: {
    flexDirection: "row",
    gap: 0,
  },
  footButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: Brand.formControlBg,
    borderWidth: 1,
    borderColor: Brand.formControlBorder,
  },
  footButtonFirst: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  footButtonLast: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  footButtonActive: {
    backgroundColor: Brand.formControlActiveBg,
    borderColor: Brand.formControlActiveBorder,
  },
  footButtonText: {
    color: Brand.formControlText,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  footButtonTextActive: {
    color: Brand.formControlActiveText,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Brand.bg,
    borderTopWidth: 1,
    borderTopColor: Brand.card,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: Brand.buttonSecondaryBg,
    alignItems: "center",
  },
  clearButtonText: {
    color: Brand.buttonSecondaryText,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Brand.green,
    alignItems: "center",
  },
  applyButtonText: {
    color: Brand.bg,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
