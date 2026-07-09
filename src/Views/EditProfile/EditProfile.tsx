import { KeyboardAwareScreen } from "@/components/KeyboardAwareScreen";
import {
  ATHLETE_AVAILABILITY_KEYS,
  AVAILABILITY_VALUE_BY_TRANSLATION_KEY,
} from "@/constants/athleteAvailability";
import { Brand } from "@/constants/theme";
import { ClubHistoryEntry } from "@/processes/types/profileTypes";
import { Icon, Spinner, Text, useTheme } from "@ui-kitten/components";
import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { styles } from "./EditProfile.styles";
import { useEditProfile } from "./useEditProfile";

const FOOT_KEYS = ["right", "left", "both"] as const;

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionBar} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const AddItemModal = ({
  visible,
  title,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    onConfirm(value);
    setValue("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.modalKeyboardAvoid}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>{title}</Text>
            <TextInput
              style={styles.modalInput}
              value={value}
              onChangeText={setValue}
              placeholder={t("editProfile.modalPlaceholder")}
              placeholderTextColor={Brand.formInputPlaceholder}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={onClose}
              >
                <Text style={styles.modalCancelText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.modalConfirmText}>
                  {t("editProfile.modalAdd")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const AvailabilityModal = ({
  visible,
  current,
  onClose,
  onSelect,
}: {
  visible: boolean;
  current: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={() => {}}
        >
          <Text style={styles.modalTitle}>{t("editProfile.availability")}</Text>
          {ATHLETE_AVAILABILITY_KEYS.map((key, idx) => {
            const val = AVAILABILITY_VALUE_BY_TRANSLATION_KEY[key];
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.optionRow,
                  idx === ATHLETE_AVAILABILITY_KEYS.length - 1 &&
                    styles.optionRowLast,
                ]}
                onPress={() => {
                  onSelect(val);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    val === current && styles.optionTextActive,
                  ]}
                >
                  {t(`editProfile.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const ClubHistoryCard = ({
  entry,
  onRemove,
}: {
  entry: ClubHistoryEntry;
  onRemove: () => void;
}) => (
  <View style={styles.clubCard}>
    <View style={styles.clubCardHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.clubName}>{entry.club}</Text>
        {entry.category ? (
          <Text style={styles.clubCategory}>
            BASE / {entry.category.toUpperCase()}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.clubDeleteButton}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon
          name="close-circle-outline"
          fill={Brand.gray}
          style={{ width: 20, height: 20 }}
        />
      </TouchableOpacity>
    </View>
    <Text style={styles.clubDates}>
      {entry.start}
      {entry.end ? ` — ${entry.end}` : ""}
    </Text>
  </View>
);

const EditProfile = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    profileForm,
    athleteForm,
    isAthlete,
    isLoading,
    isSaving,
    isUploadingAvatar,
    setProfileField,
    setAthleteField,
    handlePickAvatar,
    onAvatarLoaded,
    handleAddPosition,
    handleRemovePosition,
    handleAddStrength,
    handleRemoveStrength,
    handleAddClub,
    handleRemoveClub,
    handleSave,
    handleClose,
    isDirty,
    requiredFieldErrors,
  } = useEditProfile();

  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [strengthModalVisible, setStrengthModalVisible] = useState(false);
  const [availabilityModalVisible, setAvailabilityModalVisible] =
    useState(false);
  const [showClubForm, setShowClubForm] = useState(false);
  const [clubDraft, setClubDraft] = useState({
    club: "",
    category: "",
    start: "",
    end: "",
  });

  const footLabels: Record<string, string> = {
    right: t("editProfile.footRight"),
    left: t("editProfile.footLeft"),
    both: t("editProfile.footBoth"),
  };

  const headerRight = () => (
    <TouchableOpacity
      onPress={handleSave}
      disabled={isSaving || !isDirty}
      activeOpacity={0.7}
      style={{ paddingHorizontal: 8, opacity: isDirty ? 1 : 0.4 }}
    >
      {isSaving ? (
        <ActivityIndicator size="small" color={Brand.green} />
      ) : (
        <Text
          style={{
            color: Brand.green,
            fontSize: 14,
            fontWeight: "800",
            letterSpacing: 1.5,
          }}
        >
          {t("editProfile.save")}
        </Text>
      )}
    </TouchableOpacity>
  );

  const headerOptions = {
    title: t("editProfile.title"),
    headerStyle: { backgroundColor: Brand.bg },
    headerTintColor: Brand.white,
    headerTitleStyle: {
      color: Brand.white,
      fontWeight: "bold" as const,
      letterSpacing: 1.5,
      fontSize: 14,
    },
    headerLeft: () => (
      <TouchableOpacity onPress={handleClose}>
        <Icon
          name="close-outline"
          fill={Brand.white}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>
    ),
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </>
    );
  }

  const initials = profileForm.name
    ? profileForm.name
        .trim()
        .split(/\s+/)
        .map((p) => p.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const displayAvailability = athleteForm?.availability
    ? ATHLETE_AVAILABILITY_KEYS.find(
        (k) =>
          AVAILABILITY_VALUE_BY_TRANSLATION_KEY[k] === athleteForm.availability,
      )
    : null;

  return (
    <>
      <Stack.Screen options={{ ...headerOptions, headerRight }} />
      <KeyboardAwareScreen
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Avatar ── */}
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={handlePickAvatar}
          disabled={isUploadingAvatar}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarRing,
                { borderColor: theme["color-primary-500"] },
              ]}
            >
            {profileForm.avatarUrl ? (
              <Image
                source={{ uri: profileForm.avatarUrl }}
                style={[styles.avatarImage, { borderRadius: 50 }]}
                onLoad={onAvatarLoaded}
                onError={onAvatarLoaded}
              />
            ) : (
                <View style={styles.avatarFallback}>
                  <Text
                    category="h4"
                    style={{ color: theme["color-primary-500"] }}
                  >
                    {initials}
                  </Text>
                </View>
              )}
              {isUploadingAvatar && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="large" color={Brand.green} />
                </View>
              )}
            </View>
            {!isUploadingAvatar && (
              <View style={styles.cameraBadge}>
                <Icon
                  name="camera-outline"
                  fill={Brand.buttonPrimaryText}
                  style={{ width: 16, height: 16 }}
                />
              </View>
            )}
          </View>
          <Text style={styles.avatarLabel}>{t("editProfile.changePhoto")}</Text>
        </TouchableOpacity>

        {/* ══════════════════════════════════════════
             PART 1 — Profile data (all roles)
           ══════════════════════════════════════════ */}
        <SectionHeader title={t("editProfile.personalData")} />

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { marginTop: 0 }]}>
            {t("editProfile.name")}
          </Text>
          <TextInput
            style={[styles.input, requiredFieldErrors.name && styles.inputError]}
            value={profileForm.name}
            onChangeText={(v) => setProfileField("name", v)}
            placeholder={t("editProfile.namePlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>{t("editProfile.username")}</Text>
          <TextInput
            style={[
              styles.input,
              requiredFieldErrors.username && styles.inputError,
            ]}
            value={profileForm.username}
            onChangeText={(v) => setProfileField("username", v)}
            placeholder={t("editProfile.usernamePlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            autoCapitalize="none"
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.fieldLabel}>{t("editProfile.city")}</Text>
              <TextInput
                style={[
                  styles.input,
                  requiredFieldErrors.city && styles.inputError,
                ]}
                value={profileForm.city}
                onChangeText={(v) => setProfileField("city", v)}
                placeholder={t("editProfile.cityPlaceholder")}
                placeholderTextColor={Brand.formInputPlaceholder}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.fieldLabel}>
                {t("editProfile.stateProv")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  requiredFieldErrors.state && styles.inputError,
                ]}
                value={profileForm.state}
                onChangeText={(v) => setProfileField("state", v)}
                placeholder={t("editProfile.statePlaceholder")}
                placeholderTextColor={Brand.formInputPlaceholder}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>{t("editProfile.birthDate")}</Text>
          <TextInput
            style={[
              styles.input,
              requiredFieldErrors.birthDate && styles.inputError,
            ]}
            value={profileForm.birthDate}
            onChangeText={(v) => setProfileField("birthDate", v)}
            placeholder={t("editProfile.birthDatePlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            keyboardType="number-pad"
            maxLength={10}
          />

          <Text style={styles.fieldLabel}>{t("editProfile.phone")}</Text>
          <TextInput
            style={[
              styles.input,
              requiredFieldErrors.phone && styles.inputError,
            ]}
            value={profileForm.phone}
            onChangeText={(v) => setProfileField("phone", v)}
            placeholder={t("editProfile.phonePlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            keyboardType="phone-pad"
          />
        </View>

        {/* ══════════════════════════════════════════
             PART 2 — Athlete data (role === athlete)
           ══════════════════════════════════════════ */}
        {isAthlete && athleteForm && (
          <>
            {/* ── Dados Físicos ── */}
            <SectionHeader title={t("editProfile.physicalData")} />
            <View style={styles.fieldGroup}>
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={[styles.fieldLabel, { marginTop: 0 }]}>
                    {t("editProfile.heightCm")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={athleteForm.height}
                    onChangeText={(v) => setAthleteField("height", v)}
                    placeholder="185"
                    placeholderTextColor={Brand.formInputPlaceholder}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={[styles.fieldLabel, { marginTop: 0 }]}>
                    {t("editProfile.weightKg")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={athleteForm.weight}
                    onChangeText={(v) => setAthleteField("weight", v)}
                    placeholder="78"
                    placeholderTextColor={Brand.formInputPlaceholder}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>
                {t("editProfile.dominantFoot")}
              </Text>
              <View style={styles.toggleRow}>
                {FOOT_KEYS.map((key, idx) => {
                  const active = athleteForm.dominantFoot === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.toggleButton,
                        idx === 0 && styles.toggleButtonFirst,
                        idx === FOOT_KEYS.length - 1 &&
                          styles.toggleButtonLast,
                        active && styles.toggleButtonActive,
                      ]}
                      onPress={() => setAthleteField("dominantFoot", key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          active && styles.toggleButtonTextActive,
                        ]}
                      >
                        {footLabels[key]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Tático ── */}
            <SectionHeader title={t("editProfile.tactical")} />
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { marginTop: 0 }]}>
                {t("editProfile.positions")}
              </Text>
              <View style={styles.chipsContainer}>
                {athleteForm.positions.map((pos) => (
                  <View key={pos} style={styles.chip}>
                    <Text style={styles.chipText}>{pos}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemovePosition(pos)}
                    >
                      <Icon
                        name="close-outline"
                        fill={Brand.formControlActiveText}
                        style={styles.chipRemove}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addChipButton}
                  onPress={() => setPositionModalVisible(true)}
                >
                  <Icon
                    name="plus-outline"
                    fill={Brand.gray}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text style={styles.addChipText}>
                    {t("editProfile.addPosition")}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>
                {t("editProfile.strengths")}
              </Text>
              <View style={styles.chipsContainer}>
                {athleteForm.strengths.map((str) => (
                  <TouchableOpacity
                    key={str}
                    style={styles.strengthChip}
                    onPress={() => handleRemoveStrength(str)}
                  >
                    <Text style={styles.strengthChipText}>
                      {str.toUpperCase()}
                    </Text>
                    <Icon
                      name="close-outline"
                      fill={Brand.gray}
                      style={{ width: 14, height: 14 }}
                    />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addChipButton}
                  onPress={() => setStrengthModalVisible(true)}
                >
                  <Icon
                    name="plus-outline"
                    fill={Brand.gray}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text style={styles.addChipText}>
                    {t("editProfile.addStrength")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Status Atual ── */}
            <SectionHeader title={t("editProfile.currentStatus")} />
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { marginTop: 0 }]}>
                {t("editProfile.currentCategory")}
              </Text>
              <TextInput
                style={styles.input}
                value={athleteForm.currentCategory}
                onChangeText={(v) => setAthleteField("currentCategory", v)}
                placeholder={t("editProfile.categoryPlaceholder")}
                placeholderTextColor={Brand.formInputPlaceholder}
              />

              <Text style={styles.fieldLabel}>
                {t("editProfile.availability")}
              </Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setAvailabilityModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectText,
                    !athleteForm.availability && styles.selectPlaceholder,
                  ]}
                >
                  {displayAvailability
                    ? t(`editProfile.${displayAvailability}`)
                    : t("editProfile.availabilityPlaceholder")}
                </Text>
                <Icon
                  name="chevron-down-outline"
                  fill={Brand.gray}
                  style={styles.selectIcon}
                />
              </TouchableOpacity>
            </View>

            {/* ── Histórico de Clubes ── */}
            <SectionHeader title={t("editProfile.clubHistory")} />
            <View style={styles.fieldGroup}>
              {athleteForm.clubHistory.map((entry, idx) => (
                <ClubHistoryCard
                  key={`${entry.club}-${idx}`}
                  entry={entry}
                  onRemove={() => handleRemoveClub(idx)}
                />
              ))}

              {showClubForm ? (
                <View style={styles.clubForm}>
                  <View>
                    <Text style={styles.clubFormLabel}>
                      {t("editProfile.clubName")}
                    </Text>
                    <TextInput
                      style={styles.clubFormInput}
                      value={clubDraft.club}
                      onChangeText={(v) =>
                        setClubDraft((d) => ({ ...d, club: v }))
                      }
                      placeholder={t("editProfile.clubNamePlaceholder")}
                      placeholderTextColor={Brand.formInputPlaceholder}
                      autoFocus
                    />
                  </View>

                  <View>
                    <Text style={styles.clubFormLabel}>
                      {t("editProfile.clubCategory")}
                    </Text>
                    <TextInput
                      style={styles.clubFormInput}
                      value={clubDraft.category}
                      onChangeText={(v) =>
                        setClubDraft((d) => ({ ...d, category: v }))
                      }
                      placeholder={t("editProfile.clubCategoryPlaceholder")}
                      placeholderTextColor={Brand.formInputPlaceholder}
                    />
                  </View>

                  <View style={styles.clubFormRow}>
                    <View style={styles.clubFormField}>
                      <Text style={styles.clubFormLabel}>
                        {t("editProfile.clubStart")}
                      </Text>
                      <TextInput
                        style={styles.clubFormInput}
                        value={clubDraft.start}
                        onChangeText={(v) =>
                          setClubDraft((d) => ({ ...d, start: v }))
                        }
                        placeholder={t("editProfile.clubStartPlaceholder")}
                        placeholderTextColor={Brand.formInputPlaceholder}
                      />
                    </View>
                    <View style={styles.clubFormField}>
                      <Text style={styles.clubFormLabel}>
                        {t("editProfile.clubEnd")}
                      </Text>
                      <TextInput
                        style={styles.clubFormInput}
                        value={clubDraft.end}
                        onChangeText={(v) =>
                          setClubDraft((d) => ({ ...d, end: v }))
                        }
                        placeholder={t("editProfile.clubEndPlaceholder")}
                        placeholderTextColor={Brand.formInputPlaceholder}
                      />
                    </View>
                  </View>

                  <View style={styles.clubFormActions}>
                    <TouchableOpacity
                      style={styles.clubFormCancelButton}
                      onPress={() => {
                        setShowClubForm(false);
                        setClubDraft({
                          club: "",
                          category: "",
                          start: "",
                          end: "",
                        });
                      }}
                    >
                      <Text style={styles.clubFormCancelText}>
                        {t("editProfile.clubCancel")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.clubFormConfirmButton,
                        !clubDraft.club.trim() && { opacity: 0.4 },
                      ]}
                      disabled={!clubDraft.club.trim()}
                      onPress={() => {
                        handleAddClub({
                          club: clubDraft.club.trim(),
                          category: clubDraft.category.trim(),
                          start: clubDraft.start.trim(),
                          end: clubDraft.end.trim(),
                        });
                        setClubDraft({
                          club: "",
                          category: "",
                          start: "",
                          end: "",
                        });
                        setShowClubForm(false);
                      }}
                    >
                      <Text style={styles.clubFormConfirmText}>
                        {t("editProfile.clubConfirm")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addClubButton}
                  activeOpacity={0.7}
                  onPress={() => setShowClubForm(true)}
                >
                  <Icon
                    name="plus-circle-outline"
                    fill={Brand.gray}
                    style={{ width: 20, height: 20 }}
                  />
                  <Text style={styles.addClubText}>
                    {t("editProfile.addClub")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Privacidade ── */}
            <SectionHeader title={t("editProfile.privacy")} />
            <View style={styles.fieldGroup}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>
                    {t("editProfile.searchableProfile")}
                  </Text>
                  <Text style={styles.switchSublabel}>
                    {t("editProfile.searchableSub")}
                  </Text>
                </View>
                <Switch
                  value={athleteForm.isSearchable}
                  onValueChange={(v) => setAthleteField("isSearchable", v)}
                  trackColor={{ false: Brand.border, true: Brand.green }}
                  thumbColor={Brand.white}
                />
              </View>

              <Text style={styles.fieldLabel}>
                {t("editProfile.contactVisibility")}
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioRow}
                  onPress={() =>
                    setAthleteField("contactVisibility", "clubs_agents")
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      athleteForm.contactVisibility === "clubs_agents" &&
                        styles.radioOuterActive,
                    ]}
                  >
                    {athleteForm.contactVisibility === "clubs_agents" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>
                    {t("editProfile.contactClubsAgents")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioRow}
                  onPress={() =>
                    setAthleteField("contactVisibility", "public")
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      athleteForm.contactVisibility === "public" &&
                        styles.radioOuterActive,
                    ]}
                  >
                    {athleteForm.contactVisibility === "public" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>
                    {t("editProfile.contactPublic")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ── Modals ── */}
        <AddItemModal
          visible={positionModalVisible}
          title={t("editProfile.addPositionTitle")}
          onClose={() => setPositionModalVisible(false)}
          onConfirm={handleAddPosition}
        />
        <AddItemModal
          visible={strengthModalVisible}
          title={t("editProfile.addStrengthTitle")}
          onClose={() => setStrengthModalVisible(false)}
          onConfirm={handleAddStrength}
        />
        {isAthlete && athleteForm && (
          <AvailabilityModal
            visible={availabilityModalVisible}
            current={athleteForm.availability}
            onClose={() => setAvailabilityModalVisible(false)}
            onSelect={(v) => setAthleteField("availability", v)}
          />
        )}
      </KeyboardAwareScreen>
    </>
  );
};

export default EditProfile;
