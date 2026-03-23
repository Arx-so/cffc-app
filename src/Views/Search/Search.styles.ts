import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
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
    paddingVertical: 10
  },
  filterIcon: {
    marginLeft: 8,
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
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.green,
  },
});
