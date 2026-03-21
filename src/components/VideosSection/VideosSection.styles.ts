import { Dimensions, StyleSheet } from "react-native";

const GRID_PADDING = 24;
const GRID_GAP = 8;
const COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

export const VIDEO_ITEM_SIZE = ITEM_SIZE;

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GRID_PADDING,
    marginTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
  },
  filterLabel: {
    marginLeft: 8,
    textTransform: "uppercase",
  },
  gridIconWrapper: {
    marginLeft: "auto",
  },
  gridIcon: {
    width: 22,
    height: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  statusDot: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addPlaceholder: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    width: 24,
    height: 24,
  },
});
