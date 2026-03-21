import { Brand } from "@/constants/theme";
import { authStyles as A } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles as S } from "./Signup.styles";
import { useSignup } from "./useSignup";

type ProfileKey = "athlete" | "pro" | "club";

const PROFILE_OPTIONS: {
  key: ProfileKey;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { key: "athlete", label: "Atleta", icon: "football-outline" },
  { key: "pro", label: "Profissional", icon: "person-outline" },
  { key: "club", label: "Clube", icon: "shield-outline" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    selectedRole,
    birthDateText,
    guardianEmail,
    acceptedTerms,
    acceptedPrivacy,
    isMinor,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setSelectedRole,
    onBirthDateChange,
    setGuardianEmail,
    setAcceptedTerms,
    setAcceptedPrivacy,
    onSignupPress,
    onLoginPress,
    isLoading,
  } = useSignup();

  const [emailTouched, setEmailTouched] = useState(false);
  const emailError =
    emailTouched && email.length > 0 && !EMAIL_REGEX.test(email);

  return (
    <KeyboardAvoidingView
      style={A.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          title: "CRIAR CONTA",
          headerStyle: { backgroundColor: Brand.bg },
          headerTintColor: Brand.green,
          headerTitleStyle: {
            color: Brand.white,
            fontWeight: "bold",
            letterSpacing: 1.5,
            fontSize: 14,
          },
          headerBackTitle: "",
        }}
      />

      <ScrollView
        style={A.container}
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Text style={A.heroSubtitle}>JUNTE-SE À ELITE</Text>
        <Text style={[A.heroTitle, { marginBottom: 32 }]}>
          ENTRE NO{"\n"}
          <Text style={A.heroTitleGreen}>GRAMADO DIGITAL</Text>
        </Text>

        {/* ── Profile type ── */}
        <Text style={[A.fieldLabel, { marginTop: 0 }]}>TIPO DE PERFIL</Text>
        {PROFILE_OPTIONS.map((opt) => {
          const selected = selectedRole === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[S.profileCard, selected && S.profileCardSelected]}
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
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* ── Name ── */}
        <Text style={A.fieldLabel}>NOME COMPLETO</Text>
        <TextInput
          style={A.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Seu nome de craque"
          placeholderTextColor="#444"
          autoCapitalize="words"
          editable={!isLoading}
        />

        {/* ── Email ── */}
        <Text style={A.fieldLabel}>EMAIL</Text>
        <TextInput
          style={[A.input, emailError && A.inputError]}
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          placeholder="seu@email.com"
          placeholderTextColor="#444"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        {emailError && <Text style={A.errorText}>EMAIL INVÁLIDO</Text>}

        {/* ── Password ── */}
        <Text style={A.fieldLabel}>SENHA</Text>
        <TextInput
          style={A.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#444"
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        {/* ── Confirm password ── */}
        <Text style={A.fieldLabel}>CONFIRMAR SENHA</Text>
        <TextInput
          style={A.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          placeholderTextColor="#444"
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        {/* ── Date of birth ── */}
        <Text style={A.fieldLabel}>DATA DE NASCIMENTO</Text>
        <View style={S.dateRow}>
          <TextInput
            style={S.dateInput}
            value={birthDateText}
            onChangeText={onBirthDateChange}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#444"
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

        {/* ── Minor protection ── */}
        {isMinor && (
          <>
            <View style={S.minorBanner}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Brand.green}
              />
              <Text style={S.minorBannerText}>PROTEÇÃO DE MENORES ATIVADA</Text>
            </View>
            <Text style={A.fieldLabel}>EMAIL DO RESPONSÁVEL</Text>
            <TextInput
              style={A.input}
              value={guardianEmail}
              onChangeText={setGuardianEmail}
              placeholder="email@responsavel.com"
              placeholderTextColor="#444"
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
              <Ionicons name="checkmark" size={13} color="#000" />
            )}
          </View>
          <Text style={S.checkboxLabel}>
            {"Aceito os "}
            <Text style={S.checkboxLink}>Termos de Uso</Text>
            {" da plataforma."}
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
              <Ionicons name="checkmark" size={13} color="#000" />
            )}
          </View>
          <Text style={S.checkboxLabel}>
            {"Aceito a "}
            <Text style={S.checkboxLink}>Política de Privacidade</Text>
            {" de dados."}
          </Text>
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[A.submitButton, isLoading && A.submitButtonDisabled]}
          onPress={onSignupPress}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={A.submitButtonText}>CRIAR CONTA →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={A.bottomLink}
          onPress={onLoginPress}
          disabled={isLoading}
        >
          <Text style={A.bottomLinkText}>
            {"Já possui uma conta? "}
            <Text style={A.bottomLinkBold}>ENTRAR</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;
