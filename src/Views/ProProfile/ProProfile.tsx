import { KeyboardAwareScreen } from "@/components/KeyboardAwareScreen";
import { ProProfileHeader } from "@/components/ProProfileHeader/ProProfileHeader";
import {
  documentDisplayName,
} from "@/processes/proProfile";
import type { ProIssuedValidationRow } from "@/processes/types/profileTypes";
import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Linking, Pressable, TextInput, View } from "react-native";
import { styles } from "./ProProfile.styles";
import { useProProfile } from "./useProProfile";

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionBar} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const statusColor = (
  status: ProIssuedValidationRow["status"]
): string => {
  if (status === "approved") return Brand.green;
  if (status === "rejected") return Brand.error;
  return Brand.gray;
};

const ProProfile = () => {
  const { t, i18n } = useTranslation();
  const {
    profileData,
    specialty,
    setSpecialty,
    registrationNumber,
    setRegistrationNumber,
    institution,
    setInstitution,
    isLoading,
    isError,
    handleSaveCredentials,
    resetCredentialsDraft,
    isSaving,
    handleEditProfilePress,
    handlePickVerifierDocument,
    isUploadingVerifier,
  } = useProProfile();

  const [credentialsEditing, setCredentialsEditing] = useState(false);

  const locale =
    i18n.language.startsWith("pt") ? "pt-BR"
    : i18n.language.startsWith("ja") ? "ja-JP"
    : "en-US";

  const formatShortDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  if (isLoading) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size="large" />
      </Layout>
    );
  }

  if (isError || !profileData) {
    return (
      <Layout style={styles.errorContainer}>
        <Text category="s1">{t("common.retry")}</Text>
      </Layout>
    );
  }

  const specialtyTag =
    profileData.credentials.specialty?.trim() || null;
  const showActiveBadge =
    profileData.verified ||
    profileData.document?.status === "approved";

  const docLabel = documentDisplayName(
    profileData.document,
    t("proProfile.noDocumentUploaded")
  );

  return (
    <Layout style={styles.container}>
      <KeyboardAwareScreen
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        withTabBarInset
      >
        <ProProfileHeader
          name={profileData.name}
          username={profileData.username}
          avatarUrl={profileData.avatarUrl}
          verified={profileData.verified}
          specialtyTag={specialtyTag}
          showActiveBadge={showActiveBadge}
          issuedValidationCount={profileData.issuedValidationCount}
          reputationScore={profileData.reputationScore}
          memberSinceYear={profileData.memberSinceYear}
          onEditProfilePress={handleEditProfilePress}
        />

        <SectionHeader title={t("proProfile.credentialsSection")} />
        <View style={styles.card}>
          {credentialsEditing ? (
            <>
              <View style={styles.credentialFirstLabelRow}>
                <Text style={styles.credentialFirstLabelText}>
                  {t("proProfile.specialty")}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("common.cancel")}
                  hitSlop={12}
                  onPress={() => {
                    resetCredentialsDraft();
                    setCredentialsEditing(false);
                  }}
                  style={styles.credentialIconButton}
                >
                  <Ionicons name="close-outline" size={26} color={Brand.gray} />
                </Pressable>
              </View>
              <TextInput
                style={styles.textInput}
                value={specialty}
                onChangeText={setSpecialty}
                placeholder={t("proProfile.specialtyPlaceholder")}
                placeholderTextColor={Brand.formInputPlaceholder}
              />
              <Text style={styles.fieldLabel}>{t("proProfile.registration")}</Text>
              <TextInput
                style={styles.textInput}
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholder={t("proProfile.registrationPlaceholder")}
                placeholderTextColor={Brand.formInputPlaceholder}
              />
              <Text style={styles.fieldLabel}>{t("proProfile.institution")}</Text>
              <TextInput
                style={styles.textInput}
                value={institution}
                onChangeText={setInstitution}
                placeholder={t("proProfile.institutionPlaceholder")}
                placeholderTextColor={Brand.formInputPlaceholder}
              />
              <Button
                style={styles.saveButton}
                size="medium"
                onPress={async () => {
                  try {
                    await handleSaveCredentials();
                    setCredentialsEditing(false);
                  } catch {
                    /* toast já tratado no hook */
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? `${t("common.save")}…` : t("common.save")}
              </Button>
            </>
          ) : (
            <>
              <View style={styles.credentialFirstLabelRow}>
                <Text style={styles.credentialFirstLabelText}>
                  {t("proProfile.specialty")}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("proProfile.editCredentials")}
                  hitSlop={12}
                  onPress={() => setCredentialsEditing(true)}
                  style={styles.credentialIconButton}
                >
                  <Ionicons name="create-outline" size={22} color={Brand.green} />
                </Pressable>
              </View>
              <Text
                style={[
                  styles.fieldValueReadonly,
                  !specialty.trim() && styles.fieldValueEmpty,
                ]}
              >
                {specialty.trim() ? specialty : "—"}
              </Text>
              <Text style={styles.fieldLabel}>{t("proProfile.registration")}</Text>
              <Text
                style={[
                  styles.fieldValueReadonly,
                  !registrationNumber.trim() && styles.fieldValueEmpty,
                ]}
              >
                {registrationNumber.trim() ? registrationNumber : "—"}
              </Text>
              <Text style={styles.fieldLabel}>{t("proProfile.institution")}</Text>
              <Text
                style={[
                  styles.fieldValueReadonly,
                  !institution.trim() && styles.fieldValueEmpty,
                ]}
              >
                {institution.trim() ? institution : "—"}
              </Text>
            </>
          )}
        </View>

        <SectionHeader title={t("proProfile.verifierDocumentSection")} />
        <View style={styles.card}>
          <View style={styles.docRow}>
            <View style={styles.docIcon}>
              <Text category="s1" style={{ color: Brand.green }}>
                D
              </Text>
            </View>
            <View style={styles.docMeta}>
              <Text style={styles.docFileName} numberOfLines={1}>
                {docLabel}
              </Text>
              <Text category="c2" appearance="hint" style={{ marginTop: 4 }}>
                {profileData.document
                  ? t(`proProfile.documentStatus.${profileData.document.status}`)
                  : t("proProfile.documentStatus.missing")}
              </Text>
            </View>
          </View>
          {profileData.documentSignedUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL(profileData.documentSignedUrl!)}
              style={{ alignSelf: "flex-start", marginTop: 8 }}
            >
              <Text category="s2" style={styles.docOpenLink}>
                {t("proProfile.openVerifierDocument")}
              </Text>
            </Pressable>
          ) : null}
          {profileData.document?.status === "approved" ? (
            <Text category="c2" appearance="hint" style={styles.docVerifiedNote}>
              {t("proProfile.documentVerifiedLocked")}
            </Text>
          ) : (
            <View style={styles.docActions}>
              <Text category="c2" appearance="hint" style={styles.docHint}>
                {t("proProfile.verifierDocumentHint")}
              </Text>
              <Button
                style={styles.docUploadButton}
                size="medium"
                appearance="outline"
                status="success"
                onPress={handlePickVerifierDocument}
                disabled={isUploadingVerifier || isSaving}
              >
                {isUploadingVerifier
                  ? t("proProfile.uploadingDocument")
                  : profileData.document
                    ? t("proProfile.replaceVerifierDocument")
                    : t("proProfile.uploadVerifierDocument")}
              </Button>
            </View>
          )}
        </View>

        <SectionHeader title={t("proProfile.recentValidationsSection")} />
        {profileData.recentValidations.length === 0 ? (
          <Text style={styles.emptyHint}>{t("proProfile.noRecentValidations")}</Text>
        ) : (
          <View style={[styles.card, { paddingVertical: 0 }]}>
            {profileData.recentValidations.map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.validationRow,
                  index === profileData.recentValidations.length - 1
                    ? styles.validationRowLast
                    : null,
                ]}
              >
                <View style={styles.validationAvatar}>
                  <Text style={styles.validationAvatarText}>
                    {getInitials(row.athleteName)}
                  </Text>
                </View>
                <View style={styles.validationBody}>
                  <Text style={styles.validationName}>{row.athleteName}</Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}
                  >
                    <Text style={[styles.validationMeta, { color: Brand.gray }]}>
                      {formatShortDate(row.created_at)} ·{" "}
                    </Text>
                    <Text
                      style={[styles.validationMeta, { color: statusColor(row.status) }]}
                    >
                      {t(`proProfile.validationStatus.${row.status}`)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </KeyboardAwareScreen>
    </Layout>
  );
};

export default ProProfile;
