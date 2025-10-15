import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChangeConditionData } from "./change-condition-content";

interface ChangeConditionReadonlyCardProps {
  conditionData: ChangeConditionData | null;
}

export default function ChangeConditionReadonlyCard({
  conditionData,
}: ChangeConditionReadonlyCardProps) {
  if (!conditionData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>변동률</Text>
      </View>

      <View style={styles.divider} />

      {/* 오늘 시가 기준 */}
      {!!conditionData.dailyChanges?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 시가 기준</Text>
          {conditionData.dailyChanges.map((r, i) => (
            <View key={`daily-${i}`} style={styles.row}>
              <Text style={styles.label}>
                시가 대비 {r.direction === "+" ? "상승" : "하락"}률 이상
              </Text>
              <Text style={styles.value}>
                {r.amount ? `${r.amount}%` : "-"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 현재가 기준 */}
      {!!conditionData.baseChanges?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>현재가 기준</Text>
          {conditionData.baseChanges.map((r, i) => (
            <View key={`base-${i}`} style={styles.row}>
              <Text style={styles.label}>
                현재가 대비 {r.direction === "+" ? "상승" : "하락"}률 이상
              </Text>
              <Text style={styles.value}>
                {r.amount ? `${r.amount}%` : "-"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: -12,
  },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#333" },
  value: { fontSize: 13, color: "#000", fontWeight: "500" },
});
