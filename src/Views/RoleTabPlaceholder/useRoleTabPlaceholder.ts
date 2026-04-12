import { useTranslation } from "react-i18next";

import type { RoleTabPlaceholderProps } from "./RoleTabPlaceholder.types";

export const useRoleTabPlaceholder = ({
  titleKey,
  bodyKey,
}: RoleTabPlaceholderProps) => {
  const { t } = useTranslation();
  return {
    title: t(titleKey),
    body: t(bodyKey),
  };
};
