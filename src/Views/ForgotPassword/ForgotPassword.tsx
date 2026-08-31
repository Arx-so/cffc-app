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
import { styles as F } from "./ForgotPassword.styles";
import { useForgotPassword } from "./useForgotPassword";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    emailSent,
    onSubmitPress,
    onResendPress,
    onBackToLoginPress,
    isLoading,
  } = useForgotPassword();

  return (
    <View style={S.keyboardAvoid}>
      <Stack.Screen
        options={{
          title: t("forgotPassword.title"),
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
        style={S.container}
        contentContainerStyle={[S.scrollContent, { justifyContent: "center" }]}
      >
        <Text style={S.heroSubtitle}>{t("forgotPassword.heroSubtitle")}</Text>
        <Text style={S.heroTitle}>
          {t("forgotPassword.heroTitlePrefix")}
          {"\n"}
          <Text style={S.heroTitleGreen}>
            {t("forgotPassword.heroTitleHighlight")}
          </Text>
        </Text>

        {emailSent ? (
          <>
            <View style={F.successCard}>
              <Ionicons name="mail-outline" size={40} color={Brand.green} />
              <Text style={F.successTitle}>
                {t("forgotPassword.successTitle")}
              </Text>
              <Text style={F.successText}>
                {t("forgotPassword.successDescription")}
                {"\n"}
                <Text style={F.successEmail}>{email.trim().toLowerCase()}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[S.submitButton, isLoading && S.submitButtonDisabled]}
              onPress={onBackToLoginPress}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={S.submitButtonText}>
                {t("forgotPassword.backToLogin")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={F.resendButton}
              onPress={onResendPress}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              {isLoading ? (
                <ActivityIndicator color={Brand.green} />
              ) : (
                <Text style={F.resendButtonText}>
                  {t("forgotPassword.resendEmail")}
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={F.description}>{t("forgotPassword.description")}</Text>

            <Text style={[S.fieldLabel, { marginTop: 32 }]}>
              {t("auth.email")}
            </Text>
            <TextInput
              style={S.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor={Brand.gray}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!isLoading}
              onSubmitEditing={onSubmitPress}
              returnKeyType="send"
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
                  {t("forgotPassword.submitButton")} →
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={S.bottomLink}
              onPress={onBackToLoginPress}
              disabled={isLoading}
            >
              <Text style={S.bottomLinkText}>
                {`${t("forgotPassword.rememberedPrefix")} `}
                <Text style={S.bottomLinkBold}>
                  {t("forgotPassword.backToLogin")}
                </Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAwareScreen>
    </View>
  );
};

export default ForgotPassword;
