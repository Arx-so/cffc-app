export interface ReportBlockMenuProps {
  reportedUserId: string;
  mediaId?: string;
  /** Called after a successful block, so the caller can navigate away / refresh a list. */
  onBlocked?: () => void;
  iconColor?: string;
  iconSize?: number;
}
