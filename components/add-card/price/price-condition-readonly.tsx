import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    UIManager,
    View
} from "react-native";
import { PriceConditionData } from "./price-condition-content";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PriceConditionReadonlyCardProps {
  conditionData: PriceConditionData | null;
}

export default function PriceConditionReadonlyCard({
  conditionData,
}: PriceConditionReadonlyCardProps) {
  if (!conditionData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>가격</Text>
      </View>

      <View style={styles.divider} />

      {/* 가격 제한 */}
      {!!conditionData.limits?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가격 제한</Text>
          {conditionData.limits.map((r, i) => (
            <View key={`limit-${i}`} style={styles.row}>
              <Text style={styles.label}>현재가 {r.comparison}일 때</Text>
              <Text style={styles.value}>
                {r.amount ? `${r.amount}원` : "-"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 시가 기준 */}
      {!!conditionData.openChanges?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가격 변경 (시가)</Text>
          {conditionData.openChanges.map((r, i) => (
            <View key={`open-${i}`} style={styles.row}>
              <Text style={styles.label}>
                시가 대비 {r.direction === "+" ? "상승" : "하락"} 금액 이상
              </Text>
              <Text style={styles.value}>
                {r.amount ? `${r.amount}원` : "-"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 현재가 기준 */}
      {!!conditionData.currentChanges?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가격 변경 (현재가)</Text>
          {conditionData.currentChanges.map((r, i) => (
            <View key={`curr-${i}`} style={styles.row}>
              <Text style={styles.label}>
                현재가 기준 {r.direction === "+" ? "상승" : "하락"} 금액 이상
              </Text>
              <Text style={styles.value}>
                {r.amount ? `${r.amount}원` : "-"}
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
