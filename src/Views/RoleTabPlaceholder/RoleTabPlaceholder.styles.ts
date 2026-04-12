import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: Brand.bg,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    textAlign: "center",
    color: Brand.gray,
  },
});
