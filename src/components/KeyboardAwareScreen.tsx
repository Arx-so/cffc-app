import React from "react";
import type { ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// Approx height of RoleGroupTabsLayout's absolute tab bar (64px) + marginBottom (20px).
// Used as a default bottomOffset when the screen lives below the role tabs.
export const TAB_BAR_BOTTOM_INSET = 84;

// Extra breathing room above the keyboard so the focused input is never flush
// against the keyboard top. Provides ~16px of visual margin.
const DEFAULT_EXTRA_SPACE = 16;

type Props = Omit<ScrollViewProps, "contentContainerStyle"> & {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomOffset?: number;
  extraKeyboardSpace?: number;
  /**
   * When true, adds the tab bar inset to the bottomOffset automatically. Use on
   * screens rendered inside a RoleGroup with the absolute tab bar visible.
   */
  withTabBarInset?: boolean;
};

/**
 * Default scrollable screen wrapper that keeps focused TextInputs visible above
 * the keyboard on iOS and Android. Replaces the combo of KeyboardAvoidingView +
 * ScrollView across the app.
 */
export const KeyboardAwareScreen = ({
  children,
  bottomOffset = DEFAULT_EXTRA_SPACE,
  extraKeyboardSpace,
  withTabBarInset = false,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  ...scrollProps
}: Props) => {
  const resolvedBottomOffset = withTabBarInset
    ? bottomOffset + TAB_BAR_BOTTOM_INSET
    : bottomOffset;

  return (
    <KeyboardAwareScrollView
      bottomOffset={resolvedBottomOffset}
      extraKeyboardSpace={extraKeyboardSpace}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...scrollProps}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default KeyboardAwareScreen;
