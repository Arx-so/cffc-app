import { ProfileVideo } from "@/processes/types/profileTypes";
import { Icon, Text, useTheme } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { Image, Pressable, View } from "react-native";
import { styles } from "./VideosSection.styles";

const MAX_VISIBLE = 6;

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
  onGridTogglePress,
}: VideosSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const placeholderCount = isOwnProfile
    ? Math.max(0, MAX_VISIBLE - videos.length)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text category="h6" style={styles.title}>
          {t("profile.videosTitle")}
        </Text>
      </View>

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

        {Array.from({ length: placeholderCount }).map((_, index) => (
          <Pressable
            key={`placeholder-${index}`}
            style={[
              styles.addPlaceholder,
              { backgroundColor: theme["color-basic-800"] },
            ]}
            onPress={onAddPress}
          >
            <Icon
              name="plus"
              fill={theme["color-primary-500"]}
              style={styles.addIcon}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};
