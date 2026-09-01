import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: Brand.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    color: Brand.white,
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  optionText: {
    color: Brand.white,
    fontSize: 15,
  },
  optionTextSelected: {
    color: Brand.green,
    fontWeight: "700",
  },
  optionTextDestructive: {
    color: Brand.danger,
  },
  cancelRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  cancelText: {
    color: Brand.gray,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
