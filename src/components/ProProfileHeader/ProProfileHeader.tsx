import { Brand } from "@/constants/theme";
import {
  Avatar,
  Button,
  Icon,
  Text,
  useTheme,
} from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { styles } from "./ProProfileHeader.styles";

export interface ProProfileHeaderProps {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  verified: boolean;
  specialtyTag: string | null;
  showActiveBadge: boolean;
  issuedValidationCount: number;
  /** Ausente ou null exibe traço até existir pontuação no backend. */
  reputationScore?: number | null;
  memberSinceYear: number;
  onEditProfilePress: () => void;
}

const formatStat = (value: number): string => {
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return value.toString();
};

const formatReputationDisplay = (score: number | null | undefined): string => {
  if (
    score == null ||
    typeof score !== "number" ||
    Number.isNaN(score) ||
    !Number.isFinite(score)
  ) {
    return "—";
  }
  const rounded = Math.round(score * 100) / 100;
  return rounded % 1 === 0 ? `${rounded}` : rounded.toFixed(1);
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const ProProfileHeader = ({
  name,
  username,
  avatarUrl,
  verified,
  specialtyTag,
  showActiveBadge,
  issuedValidationCount,
  reputationScore,
  memberSinceYear,
  onEditProfilePress,
}: ProProfileHeaderProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initials = getInitials(name);

  return (
    <View>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatarRing,
              { borderColor: theme["color-primary-500"] },
            ]}
          >
            {avatarUrl ? (
              <Avatar
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                shape="round"
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: Brand.card },
                ]}
              >
                <Text
                  category="h4"
                  style={{ color: theme["color-primary-500"] }}
                >
                  {initials}
                </Text>
              </View>
            )}
          </View>

          {verified && (
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: theme["color-primary-500"] },
              ]}
            >
              <Icon
                name="checkmark"
                fill="#fff"
                style={{ width: 14, height: 14 }}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text category="h5">{name}</Text>
        {username && (
          <Text category="s2" appearance="hint">
            @{username}
          </Text>
        )}
      </View>

      <View style={styles.badgeRow}>
        {specialtyTag ? (
          <View
            style={[
              styles.badgeCapsule,
              {
                backgroundColor: Brand.card,
                borderWidth: 1,
                borderColor: theme["color-primary-500"],
              },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: theme["color-primary-500"] }]}
            >
              {specialtyTag}
            </Text>
          </View>
        ) : null}
        {showActiveBadge ? (
          <View style={[styles.badgeCapsule, { backgroundColor: "#1a3d2e" }]}>
            <Text style={[styles.badgeText, { color: Brand.green }]}>
              {t("proProfile.active")}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.statsCardWrapper}>
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: Brand.card,
              borderWidth: 1,
              borderColor: theme["color-primary-500"],
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text category="h6" style={{ color: theme["color-primary-500"] }}>
              {formatStat(issuedValidationCount)}
            </Text>
            <Text category="c2" appearance="hint">
              {t("profile.validations").toUpperCase()}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text category="h6" style={{ color: "#FFAA33" }}>
              {formatReputationDisplay(reputationScore)}
            </Text>
            <Text category="c2" appearance="hint">
              {t("proProfile.reputation").toUpperCase()}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text category="h6">{memberSinceYear}</Text>
            <Text category="c2" appearance="hint">
              {t("proProfile.memberSince").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Button
          style={styles.primaryButton}
          size="large"
          onPress={onEditProfilePress}
        >
          {t("profile.editProfile")}
        </Button>
      </View>
    </View>
  );
};
