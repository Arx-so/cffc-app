import { Brand } from "@/constants/theme";
import { formatIsoDateOnlyForLocale } from "@/utils/dateDisplay";
import { formatPhoneDigitsForDisplay } from "@/utils/brazilianPhone";
import { Ionicons } from "@expo/vector-icons";
import { Spinner, Text } from "@ui-kitten/components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  UIManager,
  View,
} from "react-native";
import { styles } from "../AthleteOwnDetailsCard/AthleteOwnDetailsCard.styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ClubOwnDetailsCardProps {
  city: string | null;
  state: string | null;
  foundingDate: string | null;
  phone: string | null;
  isLoading: boolean;
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

export function ClubOwnDetailsCard({
  city,
  state,
  foundingDate,
  phone,
  isLoading,
}: ClubOwnDetailsCardProps) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const notInformed = t("profile.notInformed");

  const foundingDisplay = formatIsoDateOnlyForLocale(foundingDate, i18n.language);
  const phoneDisplay = formatPhoneDigitsForDisplay(phone);

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
            ? t("profile.detailsCollapseA11yClub")
            : t("profile.detailsExpandA11yClub")
        }
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>{t("profile.clubDetailsTitle")}</Text>
            <Text style={styles.subtitle}>{t("profile.clubDetailsSubtitle")}</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={22}
            color={Brand.white}
          />
        </View>
      </Pressable>

      {expanded ? (
        <>
          <View style={styles.divider} />
          <View style={[styles.expandedSection, { paddingBottom: 16, paddingTop: 14 }]}>
            <RowBlock
              label={t("editProfile.city")}
              value={[city ?? "", state ?? ""].filter(Boolean).join(" — ")}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("signup.foundingDateLabel")}
              value={foundingDisplay}
              notInformed={notInformed}
            />
            <RowBlock
              label={t("editProfile.phone")}
              value={phoneDisplay}
              notInformed={notInformed}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}
