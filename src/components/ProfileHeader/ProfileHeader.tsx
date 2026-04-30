import { AthleteProfileHeader, UserRole } from "@/processes/types/profileTypes";
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
import { styles } from "./ProfileHeader.styles";

export interface ProfileHeaderProps {
  profile: AthleteProfileHeader;
  isOwnProfile: boolean;
  viewerRole: UserRole;
  onEditProfilePress?: () => void;
  onValidateProfilePress?: () => void;
  onMessagePress?: () => void;
}

const formatStat = (value: number): string => {
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return value.toString();
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const ProfileHeader = ({
  profile,
  isOwnProfile,
  viewerRole,
  onEditProfilePress,
  onValidateProfilePress,
  onMessagePress,
}: ProfileHeaderProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initials = getInitials(profile.name);

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
            {profile.avatarUrl ? (
              <Avatar
                source={{ uri: profile.avatarUrl }}
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

          {profile.verified && (
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

      {/* Name & Username */}
      <View style={styles.infoSection}>
        <Text category="h5">{profile.name}</Text>
        {profile.username && (
          <Text category="s2" appearance="hint">
            @{profile.username}
          </Text>
        )}
      </View>

      {/* Stats Card */}
      <View style={styles.statsCardWrapper}>
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: Brand.card,
              borderColor: theme["color-primary-500"],
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text category="h6" style={{ color: theme["color-primary-500"] }}>
              {formatStat(profile.stats.validationCount)}
            </Text>
            <Text category="c2" appearance="hint">
              {t("profile.validations").toUpperCase()}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text category="h6" style={{ color: theme["color-primary-500"] }}>
              {formatStat(profile.stats.videoCount)}
            </Text>
            <Text category="c2" appearance="hint">
              {t("profile.videos").toUpperCase()}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text category="h6" style={{ color: theme["color-primary-500"] }}>
              {formatStat(profile.stats.contactCount)}
            </Text>
            <Text category="c2" appearance="hint">
              {t("profile.contacts").toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {isOwnProfile ? (
          <Button
            style={styles.primaryButton}
            size="large"
            onPress={onEditProfilePress}
          >
            {t("profile.editProfile")}
          </Button>
        ) : viewerRole === "pro" ? (
          <View style={styles.visitorActions}>
            {onValidateProfilePress && (
              <Button
                style={styles.primaryButtonFlex}
                size="large"
                onPress={onValidateProfilePress}
              >
                {t("profile.validateProfile")}
              </Button>
            )}
            <Button
              style={[
                styles.iconButton,
                { backgroundColor: Brand.card },
              ]}
              size="large"
              appearance="ghost"
              accessoryLeft={(props) => (
                <Icon {...props} name="email-outline" />
              )}
              onPress={onMessagePress}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};
