import { ProfileHeader } from "@/components/ProfileHeader";
import { VideosSection } from "@/components/VideosSection";
import { Brand } from "@/constants/theme";
import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { styles } from "./VisitorProfile.styles";
import { VisitorProfileProps } from "./VisitorProfile.types";
import { useVisitorProfile } from "./useVisitorProfile";

const VisitorProfile = ({ userId, username, viewerRole }: VisitorProfileProps) => {
  const { profileData, videos, isLoading, isError, handleVideoPress, handleEmitValidation } =
    useVisitorProfile(userId, username);
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
          isOwnProfile={false}
          viewerRole={viewerRole ?? "athlete"}
        />
        <VideosSection
          videos={videos}
          isOwnProfile={false}
          onVideoPress={handleVideoPress}
        />
      </ScrollView>
      {viewerRole === "pro" && (
        <Layout style={styles.emitButtonContainer}>
          <Button
            status="success"
            style={{ borderRadius: 24, borderWidth: 0 }}
            onPress={handleEmitValidation}
          >
            {t("emitValidation.emitButton")}
          </Button>
        </Layout>
      )}
    </Layout>
  );
};

export default VisitorProfile;
