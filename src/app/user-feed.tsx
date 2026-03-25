import { UserFeed } from "@/Views/UserFeed";
import { Brand } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function UserFeedScreen() {
  const { userId, username, initialIndex } = useLocalSearchParams<{
    userId: string;
    username: string;
    initialIndex: string;
  }>();

  return (
    <View style={{ flex: 1, backgroundColor: Brand.bg }}>
      <UserFeed
        userId={userId ?? ""}
        username={username ?? null}
        initialIndex={parseInt(initialIndex ?? "0", 10)}
      />
    </View>
  );
}
