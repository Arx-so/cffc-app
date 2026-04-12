import {
  Icon,
  Text,
  TopNavigation,
  useTheme,
} from "@ui-kitten/components";
import { ReactElement } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./HeaderBar.styles";
import { HeaderBarProps } from "./HeaderBar.types";

export const HeaderBar = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
}: HeaderBarProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderTitle = () => (
    <TouchableOpacity
      onPress={onLeftPress}
      disabled={!onLeftPress}
      activeOpacity={0.7}
      style={styles.titleRow}
    >
      {leftIcon && (
        <Icon
          name={leftIcon}
          fill={theme["color-primary-500"]}
          style={styles.titleIcon}
        />
      )}
      {title && (
        <Text
          category="s1"
          style={[styles.title, { color: theme["color-primary-500"] }]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRight = rightIcon
    ? () => rightIcon as ReactElement
    : undefined;

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
        accessoryRight={renderRight}
        style={styles.navigation}
      />
    </View>
  );
};
