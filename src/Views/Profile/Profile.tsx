import { VideosSection } from "@/components/VideosSection";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Brand } from "@/constants/theme";
import { Layout, Spinner, Text } from "@ui-kitten/components";
import { router } from "expo-router";
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
    handleAddVideoPress,
  } = useProfile(userId);
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
          isOwnProfile={isOwnProfile}
          viewerRole={viewerRole}
          onEditProfilePress={() => router.push("/edit-profile")}
        />
        <VideosSection
          videos={videos}
          isOwnProfile={isOwnProfile}
          onAddPress={handleAddVideoPress}
        />
      </ScrollView>
    </Layout>
  );
};

export default Profile;
