import { KeyboardAwareScreen } from "@/components/KeyboardAwareScreen";
import { LegalUrls } from "@/constants/legal";
import { Brand } from "@/constants/theme";
import { authStyles as A } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { styles as S } from "./Signup.styles";
import { useSignup } from "./useSignup";

type ProfileKey = "athlete" | "pro" | "club";

const PROFILE_OPTIONS: {
  key: ProfileKey;
  labelKey: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "athlete", labelKey: "signup.profileRoleAthlete", icon: "football-outline" },
  { key: "pro", labelKey: "signup.profileRolePro", icon: "person-outline" },
  { key: "club", labelKey: "signup.profileRoleClub", icon: "shield-outline" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FOOT_OPTIONS = [
  { key: "right", labelKey: "editProfile.footRight" },
  { key: "left", labelKey: "editProfile.footLeft" },
  { key: "both", labelKey: "editProfile.footBoth" },
] as const;
const AVAILABILITY_OPTIONS = [
  { value: "Em busca de clube", labelKey: "editProfile.availabilityLookingForClub" },
  { value: "Em negociação", labelKey: "editProfile.availabilityNegotiating" },
  { value: "Contratado", labelKey: "editProfile.availabilityContracted" },
  { value: "Livre no mercado", labelKey: "editProfile.availabilityFreeAgent" },
] as const;

const Signup = () => {
  const { t } = useTranslation();
  const {
    fullName,
    username,
    email,
    password,
    confirmPassword,
    selectedRole,
    birthDateText,
    guardianEmail,
    city,
    state,
    phone,
    athleteHeight,
    athleteWeight,
    athleteDominantFoot,
    athletePositionsText,
    athleteStrengthsText,
    athleteCurrentCategory,
    athleteAvailability,
    athleteClubHistory,
    athleteIsSearchable,
    athleteContactVisibility,
    athleteClubDraft,
    acceptedTerms,
    acceptedPrivacy,
    isMinor,
    setFullName,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    setSelectedRole,
    onBirthDateChange,
    setGuardianEmail,
    setCity,
    setState,
    onPhoneChange,
    setAthleteHeight,
    setAthleteWeight,
    setAthleteDominantFoot,
    setAthletePositionsText,
    setAthleteStrengthsText,
    setAthleteCurrentCategory,
    setAthleteAvailability,
    setAthleteIsSearchable,
    setAthleteContactVisibility,
    setAthleteClubDraft,
    onAddAthleteClub,
    onRemoveAthleteClub,
    setAcceptedTerms,
    setAcceptedPrivacy,
    onSignupPress,
    onLoginPress,
    isLoading,
  } = useSignup();

  const [emailTouched, setEmailTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isAthleteDataExpanded, setIsAthleteDataExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const emailError =
    emailTouched && email.length > 0 && !EMAIL_REGEX.test(email);
  const canPressCreateAccount = acceptedTerms && acceptedPrivacy;
  const showRequiredErrors = submitAttempted;
  const profileTypeError = showRequiredErrors && !selectedRole;
  const fullNameError = showRequiredErrors && !fullName.trim();
  const usernameError = showRequiredErrors && !username.trim();
  const emailRequiredError = showRequiredErrors && !email.trim();
  const passwordError = showRequiredErrors && !password;
  const confirmPasswordError = showRequiredErrors && !confirmPassword;
  const birthDateError = showRequiredErrors && !birthDateText.trim();
  const cityError = showRequiredErrors && !city.trim();
  const stateError = showRequiredErrors && !state.trim();
  const phoneError = showRequiredErrors && !phone.trim();

  const handleCreateAccountPress = () => {
    setSubmitAttempted(true);
    onSignupPress();
  };

  return (
    <View style={A.keyboardAvoid}>
      <Stack.Screen
        options={{
          title: t("signup.title"),
          headerStyle: { backgroundColor: Brand.bg },
          headerTintColor: Brand.green,
          headerTitleStyle: {
            color: Brand.white,
            fontWeight: "bold",
            fontSize: 14,
          },
          headerBackTitle: "",
        }}
      />

      <KeyboardAwareScreen
        style={A.container}
        contentContainerStyle={S.scrollContent}
      >
        {/* Hero */}
        <Text style={A.heroSubtitle}>{t("signup.heroSubtitle")}</Text>
        <Text style={[A.heroTitle, { marginBottom: 32 }]}>
          {t("signup.heroTitlePrefix")}
          {"\n"}
          <Text style={A.heroTitleGreen}>{t("signup.heroTitleHighlight")}</Text>
        </Text>

        {/* ── Profile type ── */}
        <Text style={[A.fieldLabel, { marginTop: 0 }]}>{t("signup.profileTypeLabel")} <Text style={A.requiredMark}>*</Text></Text>
        {PROFILE_OPTIONS.map((opt) => {
          const selected = selectedRole === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                S.profileCard,
                selected && S.profileCardSelected,
                profileTypeError && S.profileCardError,
              ]}
              onPress={() => setSelectedRole(opt.key)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={opt.icon}
                size={26}
                color={selected ? Brand.green : "#666"}
                style={S.profileCardIcon}
              />
              <Text
                style={[
                  S.profileCardLabel,
                  selected && S.profileCardLabelSelected,
                ]}
              >
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* ── Name ── */}
        <Text style={A.fieldLabel}>{t("signup.fullNameLabel")} <Text style={A.requiredMark}>*</Text></Text>
        <TextInput
          style={[A.input, fullNameError && A.inputError]}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t("signup.fullNamePlaceholder")}
          placeholderTextColor={Brand.formInputPlaceholder}
          autoCapitalize="words"
          editable={!isLoading}
        />

        {/* ── Username ── */}
        <Text style={A.fieldLabel}>{t("editProfile.username")} <Text style={A.requiredMark}>*</Text></Text>
        <TextInput
          style={[A.input, usernameError && A.inputError]}
          value={username}
          onChangeText={setUsername}
          placeholder={t("editProfile.usernamePlaceholder")}
          placeholderTextColor={Brand.formInputPlaceholder}
          autoCapitalize="none"
          editable={!isLoading}
        />

        {/* ── Email ── */}
        <Text style={A.fieldLabel}>{t("auth.email")} <Text style={A.requiredMark}>*</Text></Text>
        <TextInput
          style={[A.input, (emailError || emailRequiredError) && A.inputError]}
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor={Brand.formInputPlaceholder}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        {emailError && <Text style={A.errorText}>{t("signup.invalidEmail")}</Text>}

        {/* ── Password ── */}
        <Text style={A.fieldLabel}>{t("auth.password")} <Text style={A.requiredMark}>*</Text></Text>
        <View style={[S.passwordRow, passwordError && A.inputError]}>
          <TextInput
            style={S.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.passwordPlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="oneTimeCode"
            importantForAutofill="no"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={S.passwordEyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.75}
            disabled={isLoading}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Brand.gray}
            />
          </TouchableOpacity>
        </View>

        {/* ── Confirm password ── */}
        <Text style={A.fieldLabel}>{t("auth.confirmPassword")} <Text style={A.requiredMark}>*</Text></Text>
        <View style={[S.passwordRow, confirmPasswordError && A.inputError]}>
          <TextInput
            style={S.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="oneTimeCode"
            importantForAutofill="no"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={S.passwordEyeButton}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            activeOpacity={0.75}
            disabled={isLoading}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Brand.gray}
            />
          </TouchableOpacity>
        </View>

        {/* ── Date of birth ── */}
        <Text style={A.fieldLabel}>{t("editProfile.birthDate")} <Text style={A.requiredMark}>*</Text></Text>
        <View style={[S.dateRow, birthDateError && A.inputError]}>
          <TextInput
            style={S.dateInput}
            value={birthDateText}
            onChangeText={onBirthDateChange}
            placeholder={t("signup.birthDatePlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            keyboardType="number-pad"
            maxLength={10}
            editable={!isLoading}
          />
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#555"
            style={S.dateIcon}
          />
        </View>

        <Text style={A.fieldLabel}>{t("editProfile.city")} <Text style={A.requiredMark}>*</Text></Text>
        <TextInput
          style={[A.input, cityError && A.inputError]}
          value={city}
          onChangeText={setCity}
          placeholder={t("editProfile.cityPlaceholder")}
          placeholderTextColor={Brand.formInputPlaceholder}
          editable={!isLoading}
        />

        <View style={S.inlineRow}>
          <View style={S.inlineItem}>
            <Text style={A.fieldLabel}>{t("editProfile.stateProv")} <Text style={A.requiredMark}>*</Text></Text>
            <TextInput
              style={[A.input, stateError && A.inputError]}
              value={state}
              onChangeText={setState}
              placeholder={t("editProfile.statePlaceholder")}
              placeholderTextColor={Brand.formInputPlaceholder}
              editable={!isLoading}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
          <View style={S.inlineItem}>
            <Text style={A.fieldLabel}>{t("editProfile.phone")} <Text style={A.requiredMark}>*</Text></Text>
            <TextInput
              style={[A.input, phoneError && A.inputError]}
              value={phone}
              onChangeText={onPhoneChange}
              placeholder={t("editProfile.phonePlaceholder")}
              placeholderTextColor={Brand.formInputPlaceholder}
              editable={!isLoading}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {selectedRole === "athlete" && (
          <>
            <Text style={S.sectionTitle}>{t("signup.athleteDataTitle")}</Text>
            <View style={S.expandableHeader}>
              <TouchableOpacity
                style={S.expandButton}
                onPress={() => setIsAthleteDataExpanded((prev) => !prev)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isAthleteDataExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                  size={16}
                  color={Brand.green}
                />
                <Text style={S.expandButtonText}>
                  {isAthleteDataExpanded
                    ? t("signup.athleteDataCollapse")
                    : t("signup.athleteDataExpand")}
                </Text>
              </TouchableOpacity>
              <Text style={S.expandHintText}>{t("signup.athleteDataFillLaterHint")}</Text>
            </View>

            {isAthleteDataExpanded && (
              <>
                <View style={S.inlineRow}>
                  <View style={S.inlineItem}>
                    <Text style={A.fieldLabel}>{t("editProfile.heightCm")}</Text>
                    <TextInput
                      style={A.input}
                      value={athleteHeight}
                      onChangeText={setAthleteHeight}
                      placeholder="185"
                      placeholderTextColor={Brand.formInputPlaceholder}
                      editable={!isLoading}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                  <View style={S.inlineItem}>
                    <Text style={A.fieldLabel}>{t("editProfile.weightKg")}</Text>
                    <TextInput
                      style={A.input}
                      value={athleteWeight}
                      onChangeText={setAthleteWeight}
                      placeholder="78"
                      placeholderTextColor={Brand.formInputPlaceholder}
                      editable={!isLoading}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                </View>

                <Text style={A.fieldLabel}>{t("editProfile.dominantFoot")}</Text>
                <View style={S.optionRow}>
                  {FOOT_OPTIONS.map((option) => {
                    const active = athleteDominantFoot === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[S.optionButton, active && S.optionButtonSelected]}
                        onPress={() => setAthleteDominantFoot(option.key)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            S.optionButtonText,
                            active && S.optionButtonTextSelected,
                          ]}
                        >
                          {t(option.labelKey)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={A.fieldLabel}>{t("signup.positionsCsvLabel")}</Text>
                <TextInput
                  style={A.input}
                  value={athletePositionsText}
                  onChangeText={setAthletePositionsText}
                  placeholder={t("signup.positionsPlaceholder")}
                  placeholderTextColor={Brand.formInputPlaceholder}
                  editable={!isLoading}
                />

                <Text style={A.fieldLabel}>{t("signup.strengthsCsvLabel")}</Text>
                <TextInput
                  style={A.input}
                  value={athleteStrengthsText}
                  onChangeText={setAthleteStrengthsText}
                  placeholder={t("signup.strengthsPlaceholder")}
                  placeholderTextColor={Brand.formInputPlaceholder}
                  editable={!isLoading}
                />

                <Text style={A.fieldLabel}>{t("editProfile.currentCategory")}</Text>
                <TextInput
                  style={A.input}
                  value={athleteCurrentCategory}
                  onChangeText={setAthleteCurrentCategory}
                  placeholder={t("editProfile.categoryPlaceholder")}
                  placeholderTextColor={Brand.formInputPlaceholder}
                  editable={!isLoading}
                />

                <Text style={A.fieldLabel}>{t("editProfile.availability")}</Text>
                <View style={S.optionRow}>
                  {AVAILABILITY_OPTIONS.map((option) => {
                    const translatedOption = t(option.labelKey);
                    const active = athleteAvailability === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[S.optionButton, active && S.optionButtonSelected]}
                        onPress={() => setAthleteAvailability(option.value)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            S.optionButtonText,
                            active && S.optionButtonTextSelected,
                          ]}
                        >
                          {translatedOption}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={A.fieldLabel}>{t("editProfile.clubHistory")}</Text>
                {athleteClubHistory.map((entry, index) => (
                  <View key={`${entry.club}-${index}`} style={S.clubCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.clubTitle}>{entry.club}</Text>
                      {!!entry.category && (
                        <Text style={S.clubSubtitle}>{entry.category}</Text>
                      )}
                      <Text style={S.clubSubtitle}>
                        {entry.start}
                        {entry.end ? ` - ${entry.end}` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onRemoveAthleteClub(index)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#777" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TextInput
                  style={[A.input, S.clubDraftInput]}
                  value={athleteClubDraft.club}
                  onChangeText={(value) =>
                    setAthleteClubDraft({ ...athleteClubDraft, club: value })
                  }
                  placeholder={t("editProfile.clubNamePlaceholder")}
                  placeholderTextColor={Brand.formInputPlaceholder}
                  editable={!isLoading}
                />
                <TextInput
                  style={[A.input, S.clubDraftInput]}
                  value={athleteClubDraft.category}
                  onChangeText={(value) =>
                    setAthleteClubDraft({ ...athleteClubDraft, category: value })
                  }
                  placeholder={t("editProfile.clubCategoryPlaceholder")}
                  placeholderTextColor={Brand.formInputPlaceholder}
                  editable={!isLoading}
                />
                <View style={[S.inlineRow, S.clubDraftPeriodRow]}>
                  <View style={S.inlineItem}>
                    <TextInput
                      style={A.input}
                      value={athleteClubDraft.start}
                      onChangeText={(value) =>
                        setAthleteClubDraft({ ...athleteClubDraft, start: value })
                      }
                      placeholder={t("editProfile.clubStartPlaceholder")}
                      placeholderTextColor={Brand.formInputPlaceholder}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={S.inlineItem}>
                    <TextInput
                      style={A.input}
                      value={athleteClubDraft.end}
                      onChangeText={(value) =>
                        setAthleteClubDraft({ ...athleteClubDraft, end: value })
                      }
                      placeholder={t("editProfile.clubEndPlaceholder")}
                      placeholderTextColor={Brand.formInputPlaceholder}
                      editable={!isLoading}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={S.secondaryButton}
                  onPress={onAddAthleteClub}
                  disabled={isLoading}
                  activeOpacity={0.75}
                >
                  <Text style={S.secondaryButtonText}>{t("editProfile.addClub")}</Text>
                </TouchableOpacity>

                <View style={S.toggleRow}>
                  <Text style={A.fieldLabel}>{t("editProfile.searchableProfile")}</Text>
                  <Switch
                    value={athleteIsSearchable}
                    onValueChange={setAthleteIsSearchable}
                    disabled={isLoading}
                    trackColor={{ false: Brand.border, true: Brand.green }}
                    thumbColor={Brand.white}
                  />
                </View>

                <Text style={A.fieldLabel}>{t("editProfile.contactVisibility")}</Text>
                <View style={S.optionRow}>
                  <TouchableOpacity
                    style={[
                      S.optionButton,
                      athleteContactVisibility === "clubs_agents" &&
                        S.optionButtonSelected,
                    ]}
                    onPress={() => setAthleteContactVisibility("clubs_agents")}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        S.optionButtonText,
                        athleteContactVisibility === "clubs_agents" &&
                          S.optionButtonTextSelected,
                      ]}
                    >
                      {t("editProfile.contactClubsAgents")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      S.optionButton,
                      athleteContactVisibility === "public" &&
                        S.optionButtonSelected,
                    ]}
                    onPress={() => setAthleteContactVisibility("public")}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        S.optionButtonText,
                        athleteContactVisibility === "public" &&
                          S.optionButtonTextSelected,
                      ]}
                    >
                      {t("editProfile.contactPublic")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {/* ── Minor protection ── */}
        {isMinor && (
          <>
            <View style={S.minorBanner}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Brand.green}
              />
              <Text style={S.minorBannerText}>{t("signup.minorProtectionEnabled")}</Text>
            </View>
            <Text style={A.fieldLabel}>{t("signup.guardianEmailLabel")} <Text style={A.requiredMark}>*</Text></Text>
            <TextInput
              style={A.input}
              value={guardianEmail}
              onChangeText={setGuardianEmail}
              placeholder={t("signup.guardianEmailPlaceholder")}
              placeholderTextColor={Brand.formInputPlaceholder}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </>
        )}

        {/* ── Checkboxes ── */}
        <TouchableOpacity
          style={S.checkboxRow}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          activeOpacity={0.7}
        >
          <View style={[S.checkboxBox, acceptedTerms && S.checkboxBoxChecked]}>
            {acceptedTerms && (
              <Ionicons name="checkmark" size={13} color={Brand.buttonPrimaryText} />
            )}
          </View>
          <Text style={S.checkboxLabel}>
            {`${t("signup.acceptTermsPrefix")} `}
            <Text
              style={S.checkboxLink}
              onPress={() => WebBrowser.openBrowserAsync(LegalUrls.termsOfUse)}
            >
              {t("signup.termsOfUse")}
            </Text>
            {` ${t("signup.acceptTermsSuffix")}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={S.checkboxRow}
          onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
          activeOpacity={0.7}
        >
          <View
            style={[S.checkboxBox, acceptedPrivacy && S.checkboxBoxChecked]}
          >
            {acceptedPrivacy && (
              <Ionicons name="checkmark" size={13} color={Brand.buttonPrimaryText} />
            )}
          </View>
          <Text style={S.checkboxLabel}>
            {`${t("signup.acceptPrivacyPrefix")} `}
            <Text
              style={S.checkboxLink}
              onPress={() => WebBrowser.openBrowserAsync(LegalUrls.privacyPolicy)}
            >
              {t("signup.privacyPolicy")}
            </Text>
            {` ${t("signup.acceptPrivacySuffix")}`}
          </Text>
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[
            A.submitButton,
            (!canPressCreateAccount || isLoading) && A.submitButtonDisabled,
          ]}
          onPress={handleCreateAccountPress}
          disabled={isLoading || !canPressCreateAccount}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={Brand.buttonPrimaryText} />
          ) : (
            <Text style={A.submitButtonText}>{t("auth.createAccount")} →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={A.bottomLink}
          onPress={onLoginPress}
          disabled={isLoading}
        >
          <Text style={A.bottomLinkText}>
            {`${t("signup.alreadyHaveAccountPrefix")} `}
            <Text style={A.bottomLinkBold}>{t("login.title")}</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScreen>
    </View>
  );
};

export default Signup;
