export interface OptionsSheetOption {
  key: string;
  label: string;
  destructive?: boolean;
  selected?: boolean;
}

export interface OptionsSheetProps {
  visible: boolean;
  title?: string;
  options: OptionsSheetOption[];
  cancelLabel: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}
