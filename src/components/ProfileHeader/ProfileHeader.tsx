import { AthleteProfileHeader, UserRole } from "@/processes/types/profileTypes";
import { Brand } from "@/constants/theme";
import { Avatar, Button, Icon, Text, useTheme } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { styles } from "./ProfileHeader.styles";

export interface ProfileHeaderProps {
  profile: AthleteProfileHeader;
  isOwnProfile: boolean;
  viewerRole: UserRole;
  subtitle?: string | null;
  topSpacing?: number;
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
  subtitle,
  topSpacing,
  onEditProfilePress,
  onValidateProfilePress,
  onMessagePress,
}: ProfileHeaderProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const initials = getInitials(profile.name);
  const secondaryText =
    subtitle?.trim() ||
    (profile.username ? `@${profile.username}` : t(`roles.${profile.role}`));

  return (
    <View
      style={[
        styles.container,
        topSpacing !== undefined && { paddingTop: topSpacing },
      ]}
    >
      <View style={styles.identityRow}>
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
                fill={Brand.buttonPrimaryText}
                style={{ width: 14, height: 14 }}
              />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.nameText} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {secondaryText}
          </Text>
        </View>

        {isOwnProfile ? (
          <Button
            style={styles.headerIconButton}
            appearance="ghost"
            accessoryLeft={(props) => <Icon {...props} name="edit-2-outline" />}
            onPress={onEditProfilePress}
          />
        ) : (
          <Button
            style={styles.headerIconButton}
            appearance="ghost"
            accessoryLeft={(props) => <Icon {...props} name="compass-outline" />}
            onPress={onMessagePress}
          />
        )}
      </View>

      <View style={styles.statsCardWrapper}>
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: "transparent",
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text category="h6" style={styles.statValue}>
              {formatStat(profile.stats.validationCount)}
            </Text>
            <Text category="c2" style={styles.statLabel}>
              {t("profile.validations")}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text category="h6" style={styles.statValue}>
              {formatStat(profile.stats.videoCount)}
            </Text>
            <Text category="c2" style={styles.statLabel}>
              {t("profile.videos")}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text category="h6" style={styles.statValue}>
              {formatStat(profile.stats.contactCount)}
            </Text>
            <Text category="c2" style={styles.statLabel}>
              {t("profile.contacts")}
            </Text>
          </View>
        </View>
      </View>

      {viewerRole === "pro" && !isOwnProfile ? (
        <View style={styles.actionsSection}>
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
                { backgroundColor: Brand.buttonSecondaryBg },
              ]}
              size="large"
              appearance="ghost"
              accessoryLeft={(props) => (
                <Icon {...props} name="email-outline" />
              )}
              onPress={onMessagePress}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};
