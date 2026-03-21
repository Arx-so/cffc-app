import { VideosSection } from "@/components/VideosSection";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { styles } from "./Profile.styles";
import { ProfileProps } from "./Profile.types";
import { useProfile } from "./useProfile";

const Profile = ({ userId }: ProfileProps) => {
  const {
    profileData,
    videos,
    isOwnProfile,
    viewerRole,
    isLoading,
    isError,
  } = useProfile(userId);
  const theme = useTheme();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Layout
        style={[
          styles.loadingContainer,
          { backgroundColor: theme["background-basic-color-2"] },
        ]}
      >
        <Spinner size="large" />
      </Layout>
    );
  }

  if (isError || !profileData) {
    return (
      <Layout
        style={[
          styles.errorContainer,
          { backgroundColor: theme["background-basic-color-2"] },
        ]}
      >
        <Text category="s1">{t("common.retry")}</Text>
      </Layout>
    );
  }

  return (
    <Layout
      style={[
        styles.container,
        { backgroundColor: theme["background-basic-color-2"] },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          profile={profileData}
          isOwnProfile={isOwnProfile}
          viewerRole={viewerRole}
        />
        <VideosSection
          videos={videos}
          isOwnProfile={isOwnProfile}
        />
      </ScrollView>
    </Layout>
  );
};

export default Profile;
