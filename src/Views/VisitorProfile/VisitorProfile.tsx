import { AthleteOwnDetailsCard } from "@/components/AthleteOwnDetailsCard/AthleteOwnDetailsCard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { VideosSection } from "@/components/VideosSection";
import { Brand } from "@/constants/theme";
import { Layout, Spinner, Text } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { positionLabel } from "@/utils/athleteAttributeLabels";
import { ScrollView } from "react-native";
import { styles } from "./VisitorProfile.styles";
import { VisitorProfileProps } from "./VisitorProfile.types";
import { useVisitorProfile } from "./useVisitorProfile";

const VisitorProfile = ({ userId, username, viewerRole }: VisitorProfileProps) => {
  const {
    profileData,
    videos,
    isLoading,
    isError,
    hasExistingValidation,
    visitorAthleteDetailsExtra,
    handleVideoPress,
    handleEmitValidation,
  } = useVisitorProfile(userId, username);
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
          subtitle={
            visitorAthleteDetailsExtra?.athleteProfile?.positions?.[0]
              ? positionLabel(t, visitorAthleteDetailsExtra.athleteProfile.positions[0])
              : null
          }
          isOwnProfile={false}
          viewerRole={viewerRole ?? "athlete"}
          onValidateProfilePress={hasExistingValidation ? undefined : handleEmitValidation}
        />
        {profileData.role === "athlete" && visitorAthleteDetailsExtra !== null ? (
          <AthleteOwnDetailsCard
            city={profileData.city}
            state={profileData.state}
            birthDate={visitorAthleteDetailsExtra.birthDate}
            phone={visitorAthleteDetailsExtra.phone}
            athleteRow={visitorAthleteDetailsExtra.athleteProfile}
            isLoading={visitorAthleteDetailsExtra.isLoading}
          />
        ) : null}
        <VideosSection
          videos={videos}
          isOwnProfile={false}
          onVideoPress={handleVideoPress}
        />
      </ScrollView>
    </Layout>
  );
};

export default VisitorProfile;
