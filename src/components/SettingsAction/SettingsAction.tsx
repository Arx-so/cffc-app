import { Icon, TopNavigationAction, useTheme } from "@ui-kitten/components";
import { useRouter } from "expo-router";

export const SettingsAction = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <TopNavigationAction
      icon={(props) => (
        <Icon
          {...props}
          name="settings-2-outline"
          fill={theme["color-primary-500"]}
        />
      )}
      onPress={() => router.push("/settings")}
    />
  );
};
