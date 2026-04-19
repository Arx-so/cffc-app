import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Brand.bg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Brand.bg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Brand.green,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: Brand.gray,
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  /** Primeira linha do bloco Especialidade: rótulo à esquerda, lápis/X à direita. */
  credentialFirstLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  credentialFirstLabelText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: Brand.gray,
  },
  credentialIconButton: {
    padding: 4,
    marginRight: -4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: Brand.gray,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.white,
    marginBottom: 14,
    fontSize: 15,
  },
  fieldValueReadonly: {
    fontSize: 15,
    color: Brand.white,
    marginBottom: 14,
    paddingVertical: 4,
    minHeight: 28,
  },
  fieldValueEmpty: {
    color: Brand.gray,
    fontStyle: "italic",
  },
  saveButton: {
    marginTop: 4,
    borderRadius: 24,
    borderWidth: 0,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Brand.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Brand.border,
  },
  docMeta: {
    flex: 1,
  },
  docActions: {
    marginTop: 14,
    gap: 10,
  },
  docVerifiedNote: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: Brand.gray,
  },
  docHint: {
    fontSize: 12,
    color: Brand.gray,
    lineHeight: 18,
  },
  docUploadButton: {
    borderRadius: 22,
    borderWidth: 0,
  },
  docOpenLink: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: Brand.green,
  },
  docFileName: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.white,
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  validationRowLast: {
    borderBottomWidth: 0,
  },
  validationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Brand.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Brand.border,
  },
  validationAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.white,
  },
  validationBody: {
    flex: 1,
  },
  validationName: {
    fontSize: 15,
    fontWeight: "600",
    color: Brand.white,
  },
  validationMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyHint: {
    fontSize: 13,
    color: Brand.gray,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
});
