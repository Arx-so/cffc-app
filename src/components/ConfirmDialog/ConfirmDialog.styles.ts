import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: Brand.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  title: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    color: Brand.gray,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderColor: Brand.border,
  },
  cancelButtonText: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: Brand.buttonPrimaryBg,
    borderColor: Brand.buttonPrimaryBg,
  },
  confirmButtonText: {
    color: Brand.buttonPrimaryText,
    fontSize: 14,
    fontWeight: "700",
  },
  destructiveButton: {
    backgroundColor: "transparent",
    borderColor: Brand.danger,
  },
  destructiveButtonText: {
    color: Brand.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
