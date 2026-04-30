import { HeaderBar } from "@/components/HeaderBar";
import { VisitorProfile } from "@/Views/VisitorProfile";
import { Brand } from "@/constants/theme";
import { useAuthStore } from "@/stores/authStore";
import { router, useLocalSearchParams } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function VisitorProfileScreen() {
  const { userId, username, name } = useLocalSearchParams<{
    userId: string;
    username: string;
    name: string;
  }>();

  const role = useAuthStore((state) => state.role);
  const headerTitle = username ? `@${username}` : (name ?? "");

  return (
    <View style={styles.container}>
      <HeaderBar
        title={headerTitle}
        leftIcon="arrow-back-outline"
        onLeftPress={() => router.back()}
      />
      <VisitorProfile
        userId={userId ?? ""}
        username={username ?? null}
        viewerRole={role}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
});
