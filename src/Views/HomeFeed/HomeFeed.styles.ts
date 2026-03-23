import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  slide: {
    width: "100%",
    backgroundColor: Brand.bg,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: Brand.bg,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: Brand.white,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: Brand.bg,
  },
  emptyTitle: {
    color: Brand.white,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Brand.gray,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: Brand.bg,
  },
  errorText: {
    color: Brand.white,
    textAlign: "center",
  },
  captionContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 120,
  },
  usernameText: {
    color: Brand.green,
    fontWeight: "800",
    marginBottom: 8,
  },
  captionText: {
    color: Brand.white,
  },
  progressTrack: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 108,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(57, 255, 20, 0.28)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Brand.green,
  },
  progressThumb: {
    position: "absolute",
    top: -2,
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: Brand.green,
  },
});
