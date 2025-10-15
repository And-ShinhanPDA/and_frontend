import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RSIConditionReadonlyCardProps {
  conditionData: {
    overbought: boolean;
    oversold: boolean;
  } | null;
}

export default function RSIConditionReadonlyCard({
  conditionData,
}: RSIConditionReadonlyCardProps) {
  if (
    !conditionData ||
    (!conditionData.overbought && !conditionData.oversold)
  ) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>RSI</Text>
      </View>

      <View style={styles.divider} />

      {/* 과매수 */}
      {conditionData.overbought && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RSI 과매수 경고</Text>
          <Text style={styles.desc}>RSI ≥ 70</Text>
        </View>
      )}

      {/* 과매도 */}
      {conditionData.oversold && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RSI 과매도 경고</Text>
          <Text style={styles.desc}>RSI ≤ 30</Text>
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
    paddingVertical: 10,
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
  desc: { fontSize: 13, color: "#666", marginLeft: 4 },
});
