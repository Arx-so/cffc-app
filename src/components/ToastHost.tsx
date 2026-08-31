import { StyleSheet } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import ToastContainer from "react-native-toast-message";

type Props = {
  bottomOffset?: number;
};

export const ToastHost = ({ bottomOffset = 130 }: Props) => {
  const { height } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: height.value }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
      pointerEvents="box-none"
    >
      <ToastContainer bottomOffset={bottomOffset} position="bottom" />
    </Animated.View>
  );
};

export default ToastHost;
