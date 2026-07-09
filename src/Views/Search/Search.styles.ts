import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  headerControls: {
    paddingBottom: 24,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.inputBg,
    borderWidth: 1,
    borderColor: Brand.inputBorder,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 18,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Brand.inputText,
    fontSize: 16,
    paddingVertical: 8,
  },
  filterIcon: {
    marginLeft: 8,
  },
  list: {
    paddingHorizontal: 24,
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
  filterTabsContent: {
    paddingLeft: 24,
    paddingRight: 24,
    gap: 8,
  },
  filterTab: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.positionChipBg,
  },
  filterTabActive: {
    backgroundColor: Brand.green,
  },
  filterTabText: {
    color: Brand.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: Brand.buttonPrimaryText,
  },
});
