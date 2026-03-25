import { Brand } from "@/constants/theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { authStyles as S } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const busy = isLoading || googleLoading;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={S.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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

      <ScrollView
        style={S.container}
        contentContainerStyle={[S.scrollContent, { justifyContent: "center" }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          placeholderTextColor="#444"
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
            placeholderTextColor="#444"
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ls = StyleSheet.create({
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Brand.white,
    fontSize: 15,
  },
  passwordEyeButton: { paddingHorizontal: 14, paddingVertical: 10 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2A2A2A" },
  dividerText: { color: "#555", fontSize: 12, marginHorizontal: 12 },
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
