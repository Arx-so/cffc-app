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
  tapArea: {
    flex: 1,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(19, 21, 23, 0.18)",
  },
  centerIconWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerIconBackground: {
    width: 68,
    height: 68,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(19, 21, 23, 0.62)",
  },
  centerIcon: {
    width: 30,
    height: 30,
    marginLeft: 2,
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
    left: 24,
    right: 24,
    bottom: 68,
  },
  captionText: {
    color: Brand.searchSurface,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
  },
  progressTrack: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 54,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(212, 255, 0, 0.24)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Brand.green,
  },
  progressThumb: {
    position: "absolute",
    top: -3,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: Brand.green,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(19, 21, 23, 0.72)",
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: Brand.white,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40,
  },
});
