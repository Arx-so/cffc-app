export type ReportReason =
  | "spam"
  | "nudity_or_violence"
  | "harassment_or_bullying"
  | "fake_profile"
  | "other";

export const REPORT_REASONS: ReportReason[] = [
  "spam",
  "nudity_or_violence",
  "harassment_or_bullying",
  "fake_profile",
  "other",
];

export interface ReportContentBody {
  reportedUserId: string;
  mediaId?: string;
  reason: ReportReason;
}
