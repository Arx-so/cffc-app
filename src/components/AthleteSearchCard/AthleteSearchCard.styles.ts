import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Brand.green,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: Brand.border,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarInitials: {
    color: Brand.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  cardInfo: {
    flex: 1,
    gap: 6
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  athleteName: {
    color: Brand.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  verifiedBadge: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: Brand.white,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    color: Brand.white,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  positionText: {
    color: Brand.green,
    fontSize: 12,
    textTransform: "uppercase",
    // letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    gap: 4,
    // marginBottom: 14,
  },
  // statItem: {
  //   alignItems: "center",
  // },
  statLabel: {
    color: Brand.gray,
    fontSize: 9,
    textTransform: "uppercase",
    // letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    color: Brand.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  viewProfileButton: {
    borderWidth: 1,
    borderColor: Brand.green,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewProfileText: {
    color: Brand.green,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  halfButton: {
    flex: 1,
  },
  addFavoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Brand.green,
    borderRadius: 8,
    paddingVertical: 10,
  },
  addFavoriteButtonDisabled: {
    backgroundColor: Brand.border,
    opacity: 0.7,
  },
  addFavoriteText: {
    color: Brand.bg,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  starIcon: {
    marginLeft: 8,
    alignSelf: "flex-start",
  },
});
