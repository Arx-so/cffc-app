import { Brand } from "@/constants/theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { authStyles as A } from "@/styles/auth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as S } from "./Welcome.styles";
import { useWelcome } from "./useWelcome";

const Welcome = () => {
  const { onLoginPress, onSignupPress } = useWelcome();
  const { onGoogleSignIn, isLoading: googleLoading } = useGoogleAuth();

  return (
    <SafeAreaView style={S.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={S.top}>
        <View style={S.iconWrapper}>
          <Ionicons name="football" size={36} color={Brand.green} />
        </View>

        <Text style={A.heroSubtitle}>JUNTE-SE À ELITE</Text>
        <Text style={A.heroTitle}>
          ENTRE NO{"\n"}
          <Text style={A.heroTitleGreen}>GRAMADO{"\n"}DIGITAL</Text>
        </Text>

        <Text style={S.tagline}>
          A plataforma que conecta atletas, profissionais e clubes de futebol.
        </Text>

        <View style={S.dots}>
          <View style={[S.dot, S.dotActive]} />
          <View style={S.dot} />
          <View style={S.dot} />
        </View>
      </View>

      <View style={S.bottom}>
        <TouchableOpacity
          style={S.primaryButton}
          onPress={onLoginPress}
          activeOpacity={0.85}
        >
          <Text style={S.primaryButtonText}>ENTRAR →</Text>
        </TouchableOpacity>

        {/* Google sign-in */}
        <TouchableOpacity
          style={[ls.googleButton, googleLoading && { opacity: 0.6 }]}
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="logo-google"
                size={18}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={ls.googleButtonText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={S.secondaryButton}
          onPress={onSignupPress}
          activeOpacity={0.75}
        >
          <Text style={S.secondaryButtonText}>
            Não tem conta?{" "}
            <Text style={S.secondaryButtonHighlight}>CRIAR CONTA</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const ls = StyleSheet.create({
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

export default Welcome;
