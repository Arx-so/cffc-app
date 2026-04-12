import { VideosSection } from "@/components/VideosSection";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Brand } from "@/constants/theme";
import { Layout, Spinner, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { styles } from "./Profile.styles";
import { useProfile } from "./useProfile";

const Profile = () => {
  const {
    profileData,
    videos,
    isLoading,
    isError,
    handleAddVideoPress,
    handleVideoPress,
  } = useProfile();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Layout style={[styles.loadingContainer, { backgroundColor: Brand.bg }]}>
        <Spinner size="large" />
      </Layout>
    );
  }

  if (isError || !profileData) {
    return (
      <Layout style={[styles.errorContainer, { backgroundColor: Brand.bg }]}>
        <Text category="s1">{t("common.retry")}</Text>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { backgroundColor: Brand.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          profile={profileData}
          isOwnProfile={true}
          viewerRole={profileData.role}
          onEditProfilePress={() => router.push("/edit-profile")}
        />
        <VideosSection
          videos={videos}
          isOwnProfile={true}
          onAddPress={handleAddVideoPress}
          onVideoPress={handleVideoPress}
        />
      </ScrollView>
    </Layout>
  );
};

export default Profile;
