import { ReactNode } from "react";

export interface HeaderBarProps {
  title?: string;
  leftIcon?: string;
  rightIcon?: ReactNode;
  onLeftPress?: () => void;
  backgroundColor?: string;
  compact?: boolean;
}
