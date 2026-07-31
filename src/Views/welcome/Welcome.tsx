import { Brand } from "@/constants/theme";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as S } from "./Welcome.styles";
import { useWelcome } from "./useWelcome";

const Welcome = () => {
  const { t } = useTranslation();
  const { onLoginPress, onSignupPress } = useWelcome();
  const { onGoogleSignIn, isLoading: googleLoading } = useGoogleAuth();

  return (
    <SafeAreaView style={S.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View pointerEvents="none" style={S.backgroundArt}>
        <View style={S.backdropPanel} />
        <View style={S.backdropPanelSoft} />
        <View style={S.backdropVignette} />
      </View>

      <View style={S.content}>
        <View style={S.logoRow}>
          <View style={S.iconWrapper}>
            <View style={S.logoRingOuter}>
              <View style={S.logoRingInner}>
                <Ionicons name="football" size={24} color={Brand.green} />
              </View>
            </View>
          </View>
          <Text style={S.logoText}>BIGEYE</Text>
        </View>

        <Text style={S.heroSubtitle}>{t("welcome.heroSubtitle")}</Text>
        <Text style={S.heroTitle}>
          {t("welcome.heroTitlePrefix")}
          {"\n"}
          <Text style={S.heroTitleGreen}>{t("welcome.heroTitleHighlight")}</Text>
        </Text>

        <Text style={S.tagline}>
          {t("welcome.tagline")}
        </Text>

        <View style={S.dots}>
          <View style={[S.dot, S.dotActive]} />
          <View style={S.dot} />
          <View style={S.dot} />
          <View style={S.dot} />
        </View>

        <View style={S.bottom}>
          <TouchableOpacity
            style={S.primaryButton}
            onPress={onLoginPress}
            activeOpacity={0.85}
          >
            <Text style={S.primaryButtonText}>{t("welcome.signIn")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.secondaryButton, googleLoading && { opacity: 0.6 }]}
            onPress={onGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color={Brand.white} />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={Brand.white}
                  style={{ marginRight: 12 }}
                />
                <Text style={S.secondaryButtonText}>{t("welcome.googleButton")}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={S.createRow}>
            <Text style={S.createText}>
              {t("welcome.noAccountPrefix")}
            </Text>
            <TouchableOpacity
              style={S.createButton}
              onPress={onSignupPress}
              activeOpacity={0.75}
            >
              <Text style={S.createButtonText}>{t("auth.createAccount")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
