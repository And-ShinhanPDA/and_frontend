import { CONDITION_DESCRIPTIONS } from "@/constants/conditionDescriptions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ConditionTooltip from "../../condition/condition-tooltip";

interface SMAConditionReadonlyCardProps {
  conditionData: {
    target: { indicator: string; threshold: number } | null;
    shortCross: boolean;
    longCross: boolean;
  } | null;
}

export default function SMAConditionReadonlyCard({
  conditionData,
}: SMAConditionReadonlyCardProps) {
  if (!conditionData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>SMA</Text>
          <ConditionTooltip description={CONDITION_DESCRIPTIONS.sma} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* SMA 목표 가격 알림 표시 */}
      {conditionData.target && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMA 목표 가격 알림</Text>
          <Text style={styles.desc}>
            {`${conditionData.target.indicator
              .replace("SMA_", "SMA")
              .replace("_UP", "") // "SMA_30_UP" → "SMA30"
              .replace("_DOWN", "")} ${conditionData.target.threshold}원 ${
              conditionData.target.indicator.includes("_UP") ? "이상" : "이하"
            }`}
          </Text>
        </View>
      )}

      {/* 단기선이 장기선을 돌파 */}
      {conditionData.shortCross && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>단기선이 장기선을 돌파</Text>
        </View>
      )}

      {/* 장기선이 단기선을 누름 */}
      {conditionData.longCross && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>장기선이 단기선을 누름</Text>
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
  desc: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
    fontFamily: "Pretendard",
  },
});
