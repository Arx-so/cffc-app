import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Brand.card,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  totalCount: {
    color: Brand.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  totalLabel: {
    color: Brand.gray,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.card,
    borderRadius: 50,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Brand.white,
    fontSize: 14,
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Brand.gray,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  contactButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: Brand.green,
  },
  contactButtonDisabled: {
    backgroundColor: Brand.border,
  },
  contactButtonText: {
    color: Brand.bg,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  contactButtonTextDisabled: {
    color: Brand.gray,
  },
});
