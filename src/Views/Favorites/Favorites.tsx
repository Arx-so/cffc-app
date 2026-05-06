import { AthleteSearchCard } from "@/components/AthleteSearchCard";
import { HeaderBar } from "@/components/HeaderBar";
import { Brand } from "@/constants/theme";
import { ShortlistedAthlete } from "@/processes/types/profileTypes";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { styles } from "./Favorites.styles";
import { useFavorites } from "./useFavorites";

function ContactFooter({
  phone,
  onContact,
}: {
  phone: string | null;
  onContact: () => void;
}) {
  const { t } = useTranslation();
  const hasPhone = !!phone;

  return (
    <TouchableOpacity
      style={[styles.contactButton, !hasPhone && styles.contactButtonDisabled]}
      activeOpacity={0.8}
      onPress={onContact}
      disabled={!hasPhone}
    >
      <Ionicons
        name="call-outline"
        size={16}
        color={hasPhone ? Brand.bg : Brand.gray}
      />
      <Text
        style={[
          styles.contactButtonText,
          !hasPhone && styles.contactButtonTextDisabled,
        ]}
      >
        {hasPhone ? t("favorites.contactAthlete") : t("favorites.noPhone")}
      </Text>
    </TouchableOpacity>
  );
}

export function Favorites() {
  const { t } = useTranslation();
  const {
    query,
    setQuery,
    athletes,
    isLoading,
    isError,
    refetch,
    handleContact,
    handleViewProfile,
  } = useFavorites();

  const renderItem = ({ item }: { item: ShortlistedAthlete }) => (
    <AthleteSearchCard
      athlete={item}
      isShortlisted
      onViewProfile={() => handleViewProfile(item)}
      footer={
        <ContactFooter
          phone={item.phone}
          onContact={() => handleContact(item.phone)}
        />
      }
    />
  );

  return (
    <View style={styles.container}>
      <HeaderBar
        title={t("favorites.title")}
        rightIcon={
          <View style={styles.totalBadge}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Brand.green} />
            ) : (
              <Text style={styles.totalCount}>{athletes.length}</Text>
            )}
            <Text style={styles.totalLabel}>{t("favorites.total")}</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={styles.searchBarWrapper}>
        <Ionicons
          name="search"
          size={18}
          color={Brand.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("favorites.searchPlaceholder")}
          placeholderTextColor={Brand.gray}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Brand.green} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={[styles.emptyText, { color: Brand.green }]}>
              {t("common.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={athletes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{t("favorites.noFavorites")}</Text>
            </View>
          }
        />
      )}
      </KeyboardAvoidingView>
    </View>
  );
}
