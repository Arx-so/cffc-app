import { Brand } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Video preview ──
  videoContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    height: Math.round(SCREEN_HEIGHT * 0.68),
    backgroundColor: Brand.card,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 20,
    borderBottomWidth: 20,
    borderLeftWidth: 36,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "rgba(255,255,255,0.95)",
    marginLeft: 6,
  },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  videoPlaceholderText: {
    color: Brand.gray,
    fontSize: 13,
    letterSpacing: 1,
  },

  // ── Change video button ──
  changeVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Brand.border,
    borderRadius: 8,
  },
  changeVideoText: {
    color: Brand.gray,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // ── Thumbnail section ──
  thumbSection: {
    marginHorizontal: 16
  },
  thumbCard: {
    height: 160,
    borderRadius: 12,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbPreviewImage: {
    width: "100%",
    height: "100%",
  },
  thumbUploadIcon: {
    alignItems: "center",
    gap: 8,
  },
  thumbUploadLabel: {
    color: Brand.gray,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },

  // ── Caption ──
  sectionLabel: {
    color: Brand.gray,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
    marginHorizontal: 16,
    color: Brand.white,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  captionCounter: {
    color: Brand.gray,
    fontSize: 11,
    textAlign: "right",
    marginHorizontal: 16,
    marginTop: 6,
  },

  // ── Footer post button ──
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Brand.bg,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  postButton: {
    backgroundColor: Brand.green,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: Brand.bg,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
