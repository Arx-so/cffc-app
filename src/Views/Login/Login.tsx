import { KeyboardAwareScreen } from "@/components/KeyboardAwareScreen";
import { Brand } from "@/constants/theme";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { authStyles as S } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLogin } from "./useLogin";

const Login = () => {
  const { t } = useTranslation();
  const { email, password, setEmail, setPassword, onLoginPress, isLoading } =
    useLogin();
  const { onGoogleSignIn, isLoading: googleLoading } = useGoogleAuth();
  const { onAppleSignIn, isLoading: appleLoading } = useAppleAuth();
  const busy = isLoading || googleLoading || appleLoading;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={S.keyboardAvoid}>
      <Stack.Screen
        options={{
          title: t("login.title"),
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
        <Text style={[S.heroSubtitle, { marginBottom: 6 }]}>
          {t("login.heroSubtitle")}
        </Text>
        <Text style={S.heroTitle}>
          {t("login.heroTitlePrefix")}
          {"\n"}
          <Text style={S.heroTitleGreen}>{t("login.heroTitleHighlight")}</Text>
        </Text>

        <Text style={[S.fieldLabel, { marginTop: 40 }]}>{t("auth.email")}</Text>
        <TextInput
          style={S.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor={Brand.formInputPlaceholder}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!busy}
        />

        <Text style={S.fieldLabel}>{t("auth.password")}</Text>
        <View style={ls.passwordRow}>
          <TextInput
            style={ls.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.passwordPlaceholder")}
            placeholderTextColor={Brand.formInputPlaceholder}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="password"
            editable={!busy}
          />
          <TouchableOpacity
            style={ls.passwordEyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.75}
            disabled={busy}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={Brand.gray}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={ls.forgotPasswordLink}
          onPress={() => router.push("/forgot-password")}
          disabled={busy}
          activeOpacity={0.75}
        >
          <Text style={ls.forgotPasswordText}>
            {t("login.forgotPassword")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[S.submitButton, busy && S.submitButtonDisabled]}
          onPress={onLoginPress}
          disabled={busy}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={S.submitButtonText}>{t("login.submitButton")} →</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={ls.dividerRow}>
          <View style={ls.dividerLine} />
          <Text style={ls.dividerText}>{t("login.dividerOr")}</Text>
          <View style={ls.dividerLine} />
        </View>

        {/* Apple sign-in */}
        {Platform.OS === "ios" && (
          <View
            style={[ls.appleButtonWrap, appleLoading && S.submitButtonDisabled]}
            pointerEvents={busy ? "none" : "auto"}
          >
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={ls.appleButton}
              onPress={onAppleSignIn}
            />
          </View>
        )}

        {/* Google sign-in */}
        <TouchableOpacity
          style={[ls.googleButton, busy && S.submitButtonDisabled]}
          onPress={onGoogleSignIn}
          disabled={busy}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={Brand.white} />
          ) : (
            <>
              <Ionicons
                name="logo-google"
                size={18}
                color={Brand.white}
                style={{ marginRight: 10 }}
              />
              <Text style={ls.googleButtonText}>{t("login.googleButton")}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={S.bottomLink}
          onPress={() => router.push("/signup")}
          disabled={busy}
        >
          <Text style={S.bottomLinkText}>
            {`${t("login.noAccountPrefix")} `}
            <Text style={S.bottomLinkBold}>{t("auth.createAccount")}</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScreen>
    </View>
  );
};

const ls = StyleSheet.create({
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.formInputBg,
    borderWidth: 1,
    borderColor: Brand.formInputBorder,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Brand.formInputText,
    fontSize: 15,
  },
  passwordEyeButton: { paddingHorizontal: 14, paddingVertical: 10 },
  forgotPasswordLink: { alignSelf: "flex-end", marginTop: 12, paddingVertical: 4 },
  forgotPasswordText: {
    color: Brand.green,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2A2A2A" },
  dividerText: { color: "#555", fontSize: 12, marginHorizontal: 12 },
  appleButtonWrap: { minHeight: 48, marginBottom: 12 },
  appleButton: { height: 48 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    paddingVertical: 15,
  },
  googleButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});

export default Login;
