import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TrailingConditionData } from "./trailing-condition-content";

interface TrailingConditionReadonlyCardProps {
  conditionData: TrailingConditionData | null;
}

export default function TrailingConditionReadonlyCard({
  conditionData,
}: TrailingConditionReadonlyCardProps) {
  if (!conditionData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>후행</Text>
      </View>

      <View style={styles.divider} />

      {/* 하락 조건 */}
      {(conditionData.stopPrice || conditionData.stopPercent) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추적 손절매 (하락)</Text>
          {conditionData.stopPrice && (
            <View style={styles.row}>
              <Text style={styles.label}>최근 고가 대비 하락 금액</Text>
              <Text style={styles.value}>{conditionData.stopPrice}원</Text>
            </View>
          )}
          {conditionData.stopPercent && (
            <View style={styles.row}>
              <Text style={styles.label}>최근 고가 대비 하락 비율</Text>
              <Text style={styles.value}>{conditionData.stopPercent}%</Text>
            </View>
          )}
        </View>
      )}

      {/* 상승 조건 */}
      {(conditionData.buyPrice || conditionData.buyPercent) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추적 매수 (상승)</Text>
          {conditionData.buyPrice && (
            <View style={styles.row}>
              <Text style={styles.label}>최근 고가 대비 상승 금액</Text>
              <Text style={styles.value}>{conditionData.buyPrice}원</Text>
            </View>
          )}
          {conditionData.buyPercent && (
            <View style={styles.row}>
              <Text style={styles.label}>최근 고가 대비 상승 비율</Text>
              <Text style={styles.value}>{conditionData.buyPercent}%</Text>
            </View>
          )}
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
