import { ProfileVideo } from "@/processes/types/profileTypes";
import { Brand } from "@/constants/theme";
import { Button, Icon, Text, useTheme } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { Image, Pressable, View } from "react-native";
import { styles } from "./VideosSection.styles";

export interface VideosSectionProps {
  videos: ProfileVideo[];
  isOwnProfile: boolean;
  onAddPress?: () => void;
  onVideoPress?: (item: ProfileVideo) => void;
  onGridTogglePress?: () => void;
}

export const VideosSection = ({
  videos,
  isOwnProfile,
  onAddPress,
  onVideoPress,
}: VideosSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const isEmpty = videos.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text category="h6" style={styles.title}>
          {t("profile.videosTitle")}
        </Text>
      </View>

      {isOwnProfile && isEmpty ? (
        <View style={styles.emptyState}>
          <Icon
            name="video-outline"
            fill={theme["color-primary-500"]}
            style={styles.emptyIcon}
          />
          <Text category="s1" style={styles.emptyTitle}>
            {t("profile.noVideosTitle")}
          </Text>
          <Text category="c1" appearance="hint" style={styles.emptySubtitle}>
            {t("profile.noVideosHint")}
          </Text>
          <Button
            style={styles.emptyButton}
            size="medium"
            onPress={onAddPress}
            accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
          >
            {t("profile.addFirstVideo")}
          </Button>
        </View>
      ) : (
        <View style={styles.grid}>
          {videos.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemContainer}
              onPress={() => onVideoPress?.(item)}
            >
              <Image
                source={{ uri: item.thumbUrl ?? item.url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              {item.status === "approved" && (
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: theme["color-primary-500"] },
                  ]}
                />
              )}
            </Pressable>
          ))}

          {isOwnProfile && (
            <Pressable
              style={[styles.addPlaceholder, { backgroundColor: Brand.card }]}
              onPress={onAddPress}
            >
              <Icon
                name="plus"
                fill={theme["color-primary-500"]}
                style={styles.addIcon}
              />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};
