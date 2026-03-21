import { Brand } from "@/constants/theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { authStyles as S } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
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
  const { email, password, setEmail, setPassword, onLoginPress, isLoading } =
    useLogin();
  const { onGoogleSignIn, isLoading: googleLoading } = useGoogleAuth();
  const busy = isLoading || googleLoading;

  return (
    <KeyboardAvoidingView
      style={S.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          title: "ENTRAR",
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
          BEM-VINDO DE VOLTA
        </Text>
        <Text style={S.heroTitle}>
          ENTRE NO{"\n"}
          <Text style={S.heroTitleGreen}>GRAMADO{"\n"}DIGITAL</Text>
        </Text>

        <Text style={[S.fieldLabel, { marginTop: 40 }]}>EMAIL</Text>
        <TextInput
          style={S.input}
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor="#444"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!busy}
        />

        <Text style={S.fieldLabel}>SENHA</Text>
        <TextInput
          style={S.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#444"
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
          editable={!busy}
        />

        <TouchableOpacity
          style={[S.submitButton, busy && S.submitButtonDisabled]}
          onPress={onLoginPress}
          disabled={busy}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={S.submitButtonText}>ENTRAR →</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={ls.dividerRow}>
          <View style={ls.dividerLine} />
          <Text style={ls.dividerText}>ou</Text>
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
              <Text style={ls.googleButtonText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={S.bottomLink}
          onPress={() => router.push("/signup")}
          disabled={busy}
        >
          <Text style={S.bottomLinkText}>
            {"Não tem conta? "}
            <Text style={S.bottomLinkBold}>CRIAR CONTA</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ls = StyleSheet.create({
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
