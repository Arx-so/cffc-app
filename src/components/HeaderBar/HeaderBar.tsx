import {
  Icon,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme,
} from "@ui-kitten/components";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./HeaderBar.styles";
import { HeaderBarProps } from "./HeaderBar.types";

export const HeaderBar = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}: HeaderBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderTitle = () =>
    title ? (
      <Text
        category="s1"
        style={[styles.title, { color: theme["color-primary-500"] }]}
      >
        {title}
      </Text>
    ) : undefined;

  const renderLeft = () =>
    leftIcon ? (
      <TopNavigationAction
        icon={(props) => <Icon {...props} name={leftIcon} />}
        onPress={onLeftPress}
      />
    ) : undefined;

  const renderRight = () =>
    rightIcon ? (
      <TopNavigationAction
        icon={(props) => <Icon {...props} name={rightIcon} />}
        onPress={onRightPress}
      />
    ) : undefined;

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme["background-basic-color-2"],
      }}
    >
      <TopNavigation
        alignment="start"
        title={renderTitle}
        accessoryLeft={renderLeft}
        accessoryRight={renderRight}
        style={styles.navigation}
      />
    </View>
  );
};
