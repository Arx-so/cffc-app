import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./SearchFilter.styles";
import { useSearchFilter } from "./useSearchFilter";

const POSITION_OPTIONS = [
  { labelKey: "searchFilter.goalkeeper", value: "goalkeeper" },
  { labelKey: "searchFilter.defender", value: "defender" },
  { labelKey: "searchFilter.midfielder", value: "midfielder" },
  { labelKey: "searchFilter.forward", value: "forward" },
];

const STRENGTH_OPTIONS = [
  "speed",
  "dribbling",
  "finishing",
  "passing",
  "defending",
  "heading",
  "vision",
  "stamina",
  "strength",
  "positioning",
];

const FOOT_OPTIONS = [
  {
    labelKey: "searchFilter.right",
    value: "right",
    icon: "arrow-forward" as const,
  },
  { labelKey: "searchFilter.left", value: "left", icon: "arrow-back" as const },
  {
    labelKey: "searchFilter.both",
    value: "both",
    icon: "swap-horizontal" as const,
  },
];

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionBar} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export function SearchFilter() {
  const { t } = useTranslation();
  const {
    positions,
    ageMin,
    ageMax,
    dominantFoot,
    minHeight,
    maxWeight,
    strengths,
    togglePosition,
    toggleStrength,
    setDominantFoot,
    setAgeMin,
    setAgeMax,
    setMinHeight,
    setMaxWeight,
    handleApply,
    handleClear,
  } = useSearchFilter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSlot}>
          <TouchableOpacity style={styles.headerIconButton} onPress={handleClear}>
            <Ionicons name="close" size={22} color={Brand.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerSlotCenter}>
          <Text style={styles.headerTitle}>{t("searchFilter.title")}</Text>
        </View>
        <View style={styles.headerSlotRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* POSITION */}
        <SectionHeader title={t("searchFilter.position")} />
        <View style={styles.fieldGroup}>
          <View style={styles.chipsRow}>
            {POSITION_OPTIONS.map((opt) => {
              const active = positions.includes(opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => togglePosition(opt.value)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AGE */}
        <SectionHeader title={t("searchFilter.age")} />
        <View style={styles.fieldGroup}>
          <View style={styles.ageRow}>
            <View style={styles.ageInputWrapper}>
              <Text style={styles.fieldLabel}>{t("searchFilter.ageMin")}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ageMin}
                onChangeText={setAgeMin}
                placeholder="18"
                placeholderTextColor={Brand.gray}
                maxLength={3}
              />
            </View>
            <View style={styles.ageInputWrapper}>
              <Text style={styles.fieldLabel}>{t("searchFilter.ageMax")}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ageMax}
                onChangeText={setAgeMax}
                placeholder="35"
                placeholderTextColor={Brand.gray}
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {/* DOMINANT FOOT */}
        <SectionHeader title={t("searchFilter.dominantFoot")} />
        <View style={styles.fieldGroup}>
          <View style={styles.footRow}>
            {FOOT_OPTIONS.map((opt, idx) => {
              const active = dominantFoot === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.footButton,
                    idx === 0 && styles.footButtonFirst,
                    idx === FOOT_OPTIONS.length - 1 && styles.footButtonLast,
                    active && styles.footButtonActive,
                  ]}
                  onPress={() => setDominantFoot(active ? null : opt.value)}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={active ? Brand.green : Brand.gray}
                  />
                  <Text
                    style={[
                      styles.footButtonText,
                      active && styles.footButtonTextActive,
                    ]}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PHYSICAL TRAITS */}
        <SectionHeader title={t("searchFilter.physicalTraits")} />
        <View style={styles.fieldGroup}>
          <View style={styles.ageRow}>
            <View style={styles.ageInputWrapper}>
              <Text style={styles.fieldLabel}>
                {t("searchFilter.minHeight")}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={minHeight}
                onChangeText={setMinHeight}
                placeholder="160"
                placeholderTextColor={Brand.gray}
                maxLength={3}
              />
            </View>
            <View style={styles.ageInputWrapper}>
              <Text style={styles.fieldLabel}>
                {t("searchFilter.maxWeight")}
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxWeight}
                onChangeText={setMaxWeight}
                placeholder="90"
                placeholderTextColor={Brand.gray}
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {/* TECHNICAL ATTRIBUTES */}
        <SectionHeader title={t("searchFilter.technicalAttributes")} />
        <View style={styles.fieldGroup}>
          <View style={styles.chipsRow}>
            {STRENGTH_OPTIONS.map((str) => {
              const active = strengths.includes(str);
              return (
                <TouchableOpacity
                  key={str}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggleStrength(str)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(`searchFilter.strengths.${str}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>
            {t("searchFilter.clearAll")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>
            {t("searchFilter.applyFilters")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
