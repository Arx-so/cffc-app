import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./AthleteSearchCard.styles";
import { AthleteSearchCardProps } from "./AthleteSearchCard.types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function AthleteSearchCard({
  athlete,
  onViewProfile,
  onAddFavorite,
  isShortlisted = false,
  isAddingToShortlist = false,
  footer,
}: AthleteSearchCardProps) {
  const { t } = useTranslation();
  const position = athlete.positions[0] ?? "";

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={onViewProfile ? 0.7 : 1}
        onPress={onViewProfile}
        disabled={!onViewProfile}
      >
        <View style={styles.avatarContainer}>
          {athlete.avatarUrl ? (
            <Image
              source={{ uri: athlete.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarInitials}>
              {getInitials(athlete.name)}
            </Text>
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardNameRow}>
            <Text style={styles.athleteName}>{athlete.name}</Text>
            {athlete.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>{t("search.verified")}</Text>
              </View>
            )}
          </View>
          {!!position && <Text style={styles.positionText}>{position}</Text>}
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>{t("search.stats.videos")}</Text>
              <Text style={styles.statValue}>{athlete.videoCount}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>{t("search.stats.contacts")}</Text>
              <Text style={styles.statValue}>{athlete.contactCount}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>
                {t("search.stats.validations")}
              </Text>
              <Text style={styles.statValue}>{athlete.validationCount}</Text>
            </View>
          </View>
        </View>
        {isShortlisted && (
          <Ionicons
            name="star"
            size={18}
            color={Brand.green}
            style={styles.starIcon}
          />
        )}
      </TouchableOpacity>

      {footer !== undefined ? (
        footer
      ) : (
        <View style={onAddFavorite ? styles.buttonsRow : undefined}>
          <TouchableOpacity
            style={[
              styles.viewProfileButton,
              onAddFavorite ? styles.halfButton : undefined,
            ]}
            activeOpacity={0.8}
            onPress={onViewProfile}
          >
            <Text style={styles.viewProfileText}>
              {t("search.viewProfile")}
            </Text>
          </TouchableOpacity>

          {onAddFavorite && (
            <TouchableOpacity
              style={[
                styles.addFavoriteButton,
                styles.halfButton,
                (isShortlisted || isAddingToShortlist) &&
                  styles.addFavoriteButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={onAddFavorite}
              disabled={isShortlisted || isAddingToShortlist}
            >
              {isAddingToShortlist ? (
                <ActivityIndicator size="small" color={Brand.bg} />
              ) : isShortlisted ? (
                <>
                  <Ionicons name="star" size={14} color={Brand.bg} />
                  <Text style={styles.addFavoriteText}>
                    {t("search.favoriteAdded")}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="star-outline" size={14} color={Brand.bg} />
                  <Text style={styles.addFavoriteText}>
                    {t("search.addFavorite")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
