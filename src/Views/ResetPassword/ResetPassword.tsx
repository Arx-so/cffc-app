import { KeyboardAwareScreen } from "@/components/KeyboardAwareScreen";
import { Brand } from "@/constants/theme";
import { authStyles as S } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles as R } from "./ResetPassword.styles";
import { useResetPassword } from "./useResetPassword";

const ResetPassword = () => {
  const { t } = useTranslation();
  const {
    status,
    errorMessage,
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    showPassword,
    toggleShowPassword,
    onSubmitPress,
    onRequestNewLinkPress,
    isLoading,
  } = useResetPassword();

  const screenOptions = (
    <Stack.Screen
      options={{
        title: t("resetPassword.title"),
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
  );

  if (status === "validating") {
    return (
      <View style={S.container}>
        {screenOptions}
        <View style={R.centered}>
          <ActivityIndicator size="large" color={Brand.green} />
          <Text style={R.invalidText}>{t("resetPassword.validating")}</Text>
        </View>
      </View>
    );
  }

  if (status === "invalid") {
    return (
      <View style={S.container}>
        {screenOptions}
        <View style={R.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Brand.error} />
          <Text style={R.invalidTitle}>{t("resetPassword.invalidTitle")}</Text>
          <Text style={R.invalidText}>
            {errorMessage || t("resetPassword.invalidDescription")}
          </Text>

          <TouchableOpacity
            style={R.invalidButton}
            onPress={onRequestNewLinkPress}
            activeOpacity={0.85}
          >
            <Text style={R.invalidButtonText}>
              {t("resetPassword.requestNewLink")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={S.keyboardAvoid}>
      {screenOptions}

      <KeyboardAwareScreen
        style={S.container}
        contentContainerStyle={[S.scrollContent, { justifyContent: "center" }]}
      >
        <Text style={S.heroSubtitle}>{t("resetPassword.heroSubtitle")}</Text>
        <Text style={S.heroTitle}>
          {t("resetPassword.heroTitlePrefix")}
          {"\n"}
          <Text style={S.heroTitleGreen}>
            {t("resetPassword.heroTitleHighlight")}
          </Text>
        </Text>

        <Text style={R.description}>{t("resetPassword.description")}</Text>

        <Text style={[S.fieldLabel, { marginTop: 32 }]}>
          {t("resetPassword.newPassword")}
        </Text>
        <View style={R.passwordRow}>
          <TextInput
            style={R.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder={t("resetPassword.newPasswordPlaceholder")}
            placeholderTextColor={Brand.gray}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={R.passwordEyeButton}
            onPress={toggleShowPassword}
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
        <Text style={R.hint}>{t("resetPassword.passwordHint")}</Text>

        <Text style={S.fieldLabel}>{t("auth.confirmPassword")}</Text>
        <TextInput
          style={S.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("auth.confirmPasswordPlaceholder")}
          placeholderTextColor={Brand.gray}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          editable={!isLoading}
          onSubmitEditing={onSubmitPress}
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[S.submitButton, isLoading && S.submitButtonDisabled]}
          onPress={onSubmitPress}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={S.submitButtonText}>
              {t("resetPassword.submitButton")} →
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScreen>
    </View>
  );
};

export default ResetPassword;
