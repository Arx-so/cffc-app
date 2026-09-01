import { ConfirmDialog } from "@/components/ConfirmDialog";
import { OptionsSheet } from "@/components/OptionsSheet";
import { blockUser, reportContent } from "@/processes/moderation";
import { REPORT_REASONS, ReportReason } from "@/processes/types/moderationTypes";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { styles as S } from "./ReportBlockMenu.styles";
import { ReportBlockMenuProps } from "./ReportBlockMenu.types";

export const ReportBlockMenu = ({
  reportedUserId,
  mediaId,
  onBlocked,
  iconColor = "#FFFFFF",
  iconSize = 20,
}: ReportBlockMenuProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = useState(false);
  const [reasonSheetVisible, setReasonSheetVisible] = useState(false);
  const [blockConfirmVisible, setBlockConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = useCallback(
    async (reason: ReportReason) => {
      setReasonSheetVisible(false);
      setIsSubmitting(true);
      try {
        await reportContent({ reportedUserId, mediaId, reason });
        Toast.show({ type: "success", text1: t("moderation.reportSubmitted") });
      } catch {
        Toast.show({ type: "error", text1: t("moderation.reportError") });
      } finally {
        setIsSubmitting(false);
      }
    },
    [reportedUserId, mediaId, t]
  );

  const confirmBlock = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await blockUser(reportedUserId);
      queryClient.invalidateQueries({ queryKey: ["home-feed-videos"] });
      Toast.show({ type: "success", text1: t("moderation.blockSuccess") });
      onBlocked?.();
    } catch {
      Toast.show({ type: "error", text1: t("moderation.blockError") });
    } finally {
      setIsSubmitting(false);
      setBlockConfirmVisible(false);
    }
  }, [reportedUserId, t, queryClient, onBlocked]);

  const handleMenuSelect = useCallback((key: string) => {
    setMenuVisible(false);
    if (key === "report") setReasonSheetVisible(true);
    if (key === "block") setBlockConfirmVisible(true);
  }, []);

  return (
    <>
      <TouchableOpacity
        style={S.trigger}
        onPress={() => setMenuVisible(true)}
        disabled={isSubmitting}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-vertical" size={iconSize} color={iconColor} />
      </TouchableOpacity>

      <OptionsSheet
        visible={menuVisible}
        title={t("moderation.menuTitle")}
        options={[
          { key: "report", label: t("moderation.reportAction") },
          { key: "block", label: t("moderation.blockAction"), destructive: true },
        ]}
        cancelLabel={t("common.cancel")}
        onSelect={handleMenuSelect}
        onClose={() => setMenuVisible(false)}
      />

      <OptionsSheet
        visible={reasonSheetVisible}
        title={t("moderation.reportReasonTitle")}
        options={REPORT_REASONS.map((reason) => ({
          key: reason,
          label: t(`moderation.reasons.${reason}`),
        }))}
        cancelLabel={t("common.cancel")}
        onSelect={(key) => handleReport(key as ReportReason)}
        onClose={() => setReasonSheetVisible(false)}
      />

      <ConfirmDialog
        visible={blockConfirmVisible}
        title={t("moderation.blockConfirmTitle")}
        message={t("moderation.blockConfirmMessage")}
        cancelLabel={t("common.cancel")}
        confirmLabel={t("moderation.blockConfirmButton")}
        destructive
        isLoading={isSubmitting}
        onCancel={() => setBlockConfirmVisible(false)}
        onConfirm={confirmBlock}
      />
    </>
  );
};
