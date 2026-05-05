import {
  ATHLETE_AVAILABILITY_KEYS,
  AVAILABILITY_VALUE_BY_TRANSLATION_KEY,
} from "@/constants/athleteAvailability";
import { Brand } from "@/constants/theme";
import type { AthleteProfile, ClubHistoryEntry } from "@/processes/types/profileTypes";
import { formatIsoDateOnlyForLocale } from "@/utils/dateDisplay";
import { formatPhoneDigitsForDisplay } from "@/utils/brazilianPhone";
import { Ionicons } from "@expo/vector-icons";
import { Spinner, Text } from "@ui-kitten/components";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  UIManager,
  View,
} from "react-native";
import { styles } from "./AthleteOwnDetailsCard.styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface AthleteOwnDetailsCardProps {
  city: string | null;
  state: string | null;
  birthDate: string | null;
  phone: string | null;
  athleteRow: AthleteProfile | null;
  isLoading: boolean;
}

function availabilityKeyFromStored(
  stored: string | null | undefined,
):
  | (typeof ATHLETE_AVAILABILITY_KEYS)[number]
  | null {
  if (!stored?.trim()) return null;
  const hit = ATHLETE_AVAILABILITY_KEYS.find(
    (k) => AVAILABILITY_VALUE_BY_TRANSLATION_KEY[k] === stored,
  );
  return hit ?? null;
}

const RowBlock = ({
  label,
  value,
  notInformed,
}: {
  label: string;
  value: string;
  notInformed: string;
}) => {
  const trimmed = value.trim();
  return (
    <View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, !trimmed && styles.muted]}>
        {trimmed || notInformed}
      </Text>
    </View>
  );
};

const ClubHistoryItem = ({
  entry,
  notInformed,
  baseLabel,
}: {
  entry: ClubHistoryEntry;
  notInformed: string;
  baseLabel: string;
}) => (
  <View style={styles.clubCard}>
    <Text style={styles.clubName}>{entry.club.trim() || notInformed}</Text>
    {entry.category ? (
      <Text style={styles.clubMeta}>
        {baseLabel} / {entry.category.toUpperCase()}
      </Text>
    ) : null}
    <Text style={[styles.clubMeta, { marginTop: entry.category ? 4 : 0 }]}>
      {entry.start.trim() || notInformed}
      {entry.end.trim() ? ` — ${entry.end.trim()}` : ""}
    </Text>
  </View>
);

export function AthleteOwnDetailsCard({
  city,
  state,
  birthDate,
  phone,
  athleteRow,
  isLoading,
}: AthleteOwnDetailsCardProps) {
  const { t, i18n } = useTranslation();
  const clubBaseLabel = t("profile.clubBaseCategoryLabel");
  const [expanded, setExpanded] = useState(false);
  const notInformed = t("profile.notInformed");

  const ath = athleteRow;

  const footLabel = (foot: string | null | undefined): string => {
    if (!foot?.trim()) return "";
    const map = {
      right: t("editProfile.footRight"),
      left: t("editProfile.footLeft"),
      both: t("editProfile.footBoth"),
    } as Record<string, string>;
    return map[foot] ?? foot;
  };

  const availabilityLabel = useMemo(() => {
    const key = availabilityKeyFromStored(ath?.availability ?? null);
    if (key) return t(`editProfile.${key}`);
    return (ath?.availability ?? "").trim();
  }, [ath?.availability, t]);

  const birthDisplay = formatIsoDateOnlyForLocale(birthDate, i18n.language);
  const phoneDisplay = formatPhoneDigitsForDisplay(phone);

  const heightStr =
    ath?.height != null && ath.height > 0 ? `${ath.height} cm` : "";
  const weightStr =
    ath?.weight != null && ath.weight > 0 ? `${ath.weight} kg` : "";
  const physicalPreview = [heightStr, weightStr].filter(Boolean).join(" · ");

  const positionsCollapsed = ath?.positions?.length
    ? ath.positions.slice(0, 3).join(", ") +
      (ath.positions.length > 3 ? "…" : "")
    : "";
  const categoryPreview = (ath?.current_category ?? "").trim();

  if (isLoading) {
    return (
      <View style={[styles.card, { alignItems: "center", paddingVertical: 28 }]}>
        <Spinner />
      </View>
    );
  }

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((x) => !x);
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={
          expanded
            ? t("profile.detailsCollapseA11y")
            : t("profile.detailsExpandA11y")
        }
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>{t("profile.athleteDetailsTitle")}</Text>
            <Text style={styles.subtitle}>
              {t("profile.athleteDetailsSubtitle")}
            </Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={Brand.green}
          />
        </View>
      </Pressable>

      <View style={styles.previewBlock}>
        <View style={styles.previewRow}>
          <Text style={styles.previewCaption}>
            {t("profile.detailsPreviewPhysique")}
          </Text>
          <Text style={styles.previewLine}>
            {physicalPreview || notInformed}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewCaption}>
            {t("profile.detailsPreviewPositions")}
          </Text>
          <Text style={styles.previewLine}>
            {positionsCollapsed ? positionsCollapsed : notInformed}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewCaption}>
            {t("profile.detailsPreviewCategoryOrAvailability")}
          </Text>
          <Text style={styles.previewLine}>
            {(categoryPreview || availabilityLabel.trim()) || notInformed}
          </Text>
        </View>
      </View>

      {expanded ? (
        <>
          <View style={styles.divider} />
          <View style={[styles.expandedSection, { paddingBottom: 16 }]}>
            <Text style={styles.sectionLabel}>{t("editProfile.personalData")}</Text>
            <RowBlock
              label={t("editProfile.city")}
              value={[city ?? "", state ?? ""].filter(Boolean).join(" — ")}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.birthDate")}
              value={birthDisplay}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.phone")}
              value={phoneDisplay}
              notInformed={notInformed}
            />

            <Text style={styles.sectionLabel}>{t("editProfile.physicalData")}</Text>
            <RowBlock
              label={t("editProfile.heightCm")}
              value={heightStr}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.weightKg")}
              value={weightStr}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.dominantFoot")}
              value={footLabel(ath?.dominant_foot ?? null)}
              notInformed={notInformed}
            />

            <Text style={styles.sectionLabel}>{t("editProfile.tactical")}</Text>
            <RowBlock
              label={t("editProfile.positions")}
              value={(ath?.positions ?? []).join(", ")}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.strengths")}
              value={(ath?.strengths ?? []).join(", ")}
              notInformed={notInformed}
            />

            <Text style={styles.sectionLabel}>{t("editProfile.currentStatus")}</Text>
            <RowBlock
              label={t("editProfile.currentCategory")}
              value={categoryPreview}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.availability")}
              value={availabilityLabel.trim()}
              notInformed={notInformed}
            />

            <Text style={styles.sectionLabel}>{t("editProfile.clubHistory")}</Text>
            {ath?.club_history?.length ? (
              ath.club_history.map((entry, i) => (
                <ClubHistoryItem
                  key={`${entry.club}-${i}`}
                  entry={entry}
                  notInformed={notInformed}
                  baseLabel={clubBaseLabel}
                />
              ))
            ) : (
              <Text style={[styles.rowValue, styles.muted, { marginBottom: 4 }]}>
                {notInformed}
              </Text>
            )}
          </View>
        </>
      ) : null}
    </View>
  );
}
