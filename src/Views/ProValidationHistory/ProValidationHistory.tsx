import { AthleteSearchCard } from "@/components/AthleteSearchCard";
import { HeaderBar } from "@/components/HeaderBar";
import { Brand } from "@/constants/theme";
import { ValidationStatus } from "@/processes/types/profileTypes";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { styles } from "./ProValidationHistory.styles";
import { useProValidationHistory } from "./useProValidationHistory";

const STATUS_COLORS: Record<ValidationStatus, string> = {
  pending: Brand.amber,
  approved: Brand.green,
  rejected: Brand.error,
};

function StatusPill({ status }: { status: ValidationStatus }) {
  const { t } = useTranslation();
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.statusPill, { backgroundColor: color + "22" }]}>
      <Text style={[styles.statusPillText, { color }]}>
        {t(`proProfile.validationStatus.${status}`)}
      </Text>
    </View>
  );
}

export function ProValidationHistory() {
  const { t } = useTranslation();
  const { athletes, isLoading, isError, refetch, handleViewProfile } =
    useProValidationHistory();

  return (
    <View style={styles.container}>
      <HeaderBar title={t("proValidationHistory.title")} />
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
              badge={<StatusPill status={item.validationStatus ?? "pending"} />}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{t("proValidationHistory.empty")}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
