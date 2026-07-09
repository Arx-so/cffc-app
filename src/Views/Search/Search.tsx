import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "@/constants/theme";
import { AthleteSearchCard } from "@/components/AthleteSearchCard";
import { useSearch } from "./useSearch";
import { styles } from "./Search.styles";

const FILTER_TAB_KEYS = [
  "all",
  "attackers",
  "midfielders",
  "defenders",
  "goalkeepers",
] as const;

const FILTER_TAB_POSITION: Record<(typeof FILTER_TAB_KEYS)[number], string | null> = {
  all: null,
  attackers: "forward",
  midfielders: "midfielder",
  defenders: "defender",
  goalkeepers: "goalkeeper",
};

export function Search() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    query,
    setQuery,
    athletes,
    isLoading,
    isError,
    refetch,
    openFilter,
    hasActiveFilters,
    activePositionFilters,
    handlePositionFilterPress,
    handleViewProfile,
    handleAddFavorite,
    addingAthleteId,
    role,
  } = useSearch();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={[styles.headerControls, { paddingTop: insets.top + 16 }]}>
          <View style={styles.searchBarWrapper}>
            <Ionicons
              name="search"
              size={22}
              color={Brand.inputPlaceholder}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t("search.placeholder")}
              placeholderTextColor={Brand.inputPlaceholder}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={openFilter} style={styles.filterIcon}>
              <View>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={hasActiveFilters ? Brand.green : Brand.neutralText}
                />
                {hasActiveFilters && <View style={styles.filterBadge} />}
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsContent}
          >
            {FILTER_TAB_KEYS.map((key) => {
              const position = FILTER_TAB_POSITION[key];
              const isActive =
                position === null
                  ? activePositionFilters.length === 0
                  : activePositionFilters.includes(position);
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterTab,
                    isActive ? styles.filterTabActive : undefined,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handlePositionFilterPress(position)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isActive && styles.filterTabTextActive,
                    ]}
                  >
                    {t(`search.filterTabs.${key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
            renderItem={({ item }) => (
              <AthleteSearchCard
                athlete={item}
                variant="compact"
                onViewProfile={() => handleViewProfile(item)}
                onAddFavorite={
                  role === "club" ? () => handleAddFavorite(item.id) : undefined
                }
                isShortlisted={item.isShortlisted}
                isAddingToShortlist={addingAthleteId === item.id}
              />
            )}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>{t("search.noResults")}</Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
