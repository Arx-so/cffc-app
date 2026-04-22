import React from "react";
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "@/constants/theme";
import { HeaderBar } from "@/components/HeaderBar";
import { AthleteSearchCard } from "@/components/AthleteSearchCard";
import { useSearch } from "./useSearch";
import { styles } from "./Search.styles";

export function Search() {
  const { t } = useTranslation();
  const {
    query,
    setQuery,
    athletes,
    isLoading,
    isError,
    refetch,
    openFilter,
    hasActiveFilters,
    handleViewProfile,
    handleAddFavorite,
    addingAthleteId,
    role,
  } = useSearch();

  return (
    <View style={styles.container}>
      <HeaderBar title={t("tabs.search")} />
      <View style={styles.searchBarWrapper}>
        <Ionicons
          name="search"
          size={18}
          color={Brand.gray}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search.placeholder")}
          placeholderTextColor={Brand.gray}
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
              color={hasActiveFilters ? Brand.green : Brand.gray}
            />
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </View>
        </TouchableOpacity>
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
          renderItem={({ item }) => (
            <AthleteSearchCard
              athlete={item}
              onViewProfile={() => handleViewProfile(item)}
              onAddFavorite={role === "club" ? () => handleAddFavorite(item.id) : undefined}
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
    </View>
  );
}
