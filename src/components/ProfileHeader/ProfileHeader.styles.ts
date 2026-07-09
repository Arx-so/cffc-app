import { StyleSheet } from "react-native";

import { Brand } from "@/constants/theme";

const AVATAR_SIZE = 72;
const AVATAR_RING_SIZE = AVATAR_SIZE;
const VERIFIED_SIZE = 22;

export const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  identityRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 24,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatarRing: {
    width: AVATAR_RING_SIZE,
    height: AVATAR_RING_SIZE,
    borderRadius: AVATAR_RING_SIZE / 2,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: VERIFIED_SIZE,
    height: VERIFIED_SIZE,
    borderRadius: VERIFIED_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  nameText: {
    color: Brand.white,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
  },
  metaText: {
    color: Brand.gray,
    fontSize: 16,
    lineHeight: 24,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    marginTop: -4,
    marginRight: -8,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  statsCardWrapper: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsCard: {
    flexDirection: "row",
    minHeight: 82,
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Brand.cardAlt,
  },
  statItem: {
    width: 83,
    alignItems: "flex-start",
    gap: 0,
  },
  statValue: {
    color: Brand.white,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "700",
  },
  statLabel: {
    color: Brand.gray,
    fontSize: 14,
    lineHeight: 18,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 8,
    borderWidth: 0,
  },
  visitorActions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButtonFlex: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0,
  },
  iconButton: {
    width: 50,
    borderRadius: 8,
    borderWidth: 0,
  },
});
