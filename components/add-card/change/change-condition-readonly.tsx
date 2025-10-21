import { CONDITION_DESCRIPTIONS } from "@/constants/conditionDescriptions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ConditionTooltip from "../../condition/condition-tooltip";
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
        <View style={styles.titleRow}>
          <Text style={styles.title}>변동률</Text>
          <ConditionTooltip description={CONDITION_DESCRIPTIONS.change} />
        </View>
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
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: { 
    fontSize: 17, 
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: -16,
  },
  section: { 
    marginBottom: 12,
    paddingVertical: 6,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 8,
    color: "#666",
    fontFamily: "Pretendard",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 4,
  },
  label: { 
    fontSize: 13, 
    color: "#555",
    fontFamily: "Pretendard",
  },
  value: { 
    fontSize: 14, 
    color: "#111", 
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
});
