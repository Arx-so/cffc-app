import { Brand } from "@/constants/theme";
import { StyleSheet } from "react-native";

const AVATAR_SIZE = 100;
const AVATAR_RING_SIZE = AVATAR_SIZE + 10;
const VERIFIED_SIZE = 24;

export const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    marginTop: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarRing: {
    width: AVATAR_RING_SIZE,
    height: AVATAR_RING_SIZE,
    borderRadius: AVATAR_RING_SIZE / 2,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
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
    bottom: 2,
    right: 2,
    width: VERIFIED_SIZE,
    height: VERIFIED_SIZE,
    borderRadius: VERIFIED_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 24,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
  },
  badgeCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsCardWrapper: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 24,
    borderWidth: 0,
  },
});
