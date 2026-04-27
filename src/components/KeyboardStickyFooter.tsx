import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * Extra translateY when keyboard is closed. Useful when the footer already
   * lives on top of a tab bar (positive value keeps the footer where it was).
   * Default: 0.
   */
  closedOffset?: number;
  /**
   * Extra translateY when keyboard is opened. Typically used to lift the footer
   * a bit higher than the keyboard top. Default: 0.
   */
  openedOffset?: number;
  enabled?: boolean;
};

/**
 * Footer that sticks to the keyboard and animates in sync with it. Intended for
 * screens with a fixed action button at the bottom (e.g. AddVideo, SearchFilter).
 */
export const KeyboardStickyFooter = ({
  children,
  style,
  closedOffset = 0,
  openedOffset = 0,
  enabled = true,
}: Props) => (
  <KeyboardStickyView
    style={style}
    offset={{ closed: closedOffset, opened: openedOffset }}
    enabled={enabled}
  >
    {children}
  </KeyboardStickyView>
);

export default KeyboardStickyFooter;
