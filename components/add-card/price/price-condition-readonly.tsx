import React from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
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
