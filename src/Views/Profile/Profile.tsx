import { AthleteOwnDetailsCard } from "@/components/AthleteOwnDetailsCard/AthleteOwnDetailsCard";
import { ClubOwnDetailsCard } from "@/components/ClubOwnDetailsCard/ClubOwnDetailsCard";
import { TAB_BAR_BOTTOM_INSET } from "@/components/KeyboardAwareScreen";
import { VideosSection } from "@/components/VideosSection";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Brand } from "@/constants/theme";
import { Layout, Spinner, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { positionLabel } from "@/utils/athleteAttributeLabels";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    athleteOwnProfileExtra,
    clubOwnProfileExtra,
  } = useProfile();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding =
    TAB_BAR_BOTTOM_INSET + Math.max(insets.bottom, 0);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: scrollBottomPadding,
        }}
      >
        <ProfileHeader
          profile={profileData}
          subtitle={
            athleteOwnProfileExtra?.athleteProfile?.positions?.[0]
              ? positionLabel(t, athleteOwnProfileExtra.athleteProfile.positions[0])
              : null
          }
          topSpacing={8}
          isOwnProfile={true}
          viewerRole={profileData.role}
          onEditProfilePress={() => router.push("/edit-profile")}
        />
        {profileData.role === "athlete" && athleteOwnProfileExtra !== null ? (
          <AthleteOwnDetailsCard
            city={profileData.city}
            state={profileData.state}
            birthDate={athleteOwnProfileExtra.birthDate}
            phone={athleteOwnProfileExtra.phone}
            athleteRow={athleteOwnProfileExtra.athleteProfile}
            isLoading={athleteOwnProfileExtra.isLoading}
          />
        ) : null}
        {profileData.role === "club" && clubOwnProfileExtra !== null ? (
          <ClubOwnDetailsCard
            city={profileData.city}
            state={profileData.state}
            foundingDate={clubOwnProfileExtra.foundingDate}
            phone={clubOwnProfileExtra.phone}
            isLoading={clubOwnProfileExtra.isLoading}
          />
        ) : null}
        {profileData.role === "athlete" && (
          <VideosSection
            videos={videos}
            isOwnProfile={true}
            onAddPress={handleAddVideoPress}
            onVideoPress={handleVideoPress}
          />
        )}
      </ScrollView>
    </Layout>
  );
};

export default Profile;
