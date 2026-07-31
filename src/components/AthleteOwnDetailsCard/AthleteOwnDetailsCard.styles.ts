import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 28,
    borderRadius: 8,
    backgroundColor: Brand.detailsCardBg,
    borderWidth: 1,
    borderColor: Brand.detailsCardBorder,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
  },
  subtitle: {
    color: Brand.white,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 17,
  },
  previewBlock: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  previewRow: {
    gap: 3,
  },
  previewCaption: {
    color: Brand.gray,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  previewLine: {
    color: Brand.white,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.92,
  },
  expandedSection: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 4,
  },
  sectionLabel: {
    color: Brand.green,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  rowLabel: {
    color: Brand.gray,
    fontSize: 12,
    marginBottom: 2,
  },
  rowValue: {
    color: Brand.white,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  clubCard: {
    backgroundColor: Brand.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  clubName: {
    color: Brand.white,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  clubMeta: {
    color: Brand.gray,
    fontSize: 12,
  },
  muted: {
    color: Brand.gray,
    fontStyle: "italic",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.detailsCardBorder,
    marginHorizontal: 16,
  },
});
