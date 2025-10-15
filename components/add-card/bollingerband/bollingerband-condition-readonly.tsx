import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BollingerBandConditionReadonlyCardProps {
  conditionData: {
    upper: boolean;
    lower: boolean;
  } | null;
}

export default function BollingerBandConditionReadonlyCard({
  conditionData,
}: BollingerBandConditionReadonlyCardProps) {
  if (!conditionData || (!conditionData.upper && !conditionData.lower)) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>볼린저밴드</Text>
      </View>

      <View style={styles.divider} />

      {conditionData.upper && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>볼린저 밴드 강세 신호 경고</Text>
          <Text style={styles.desc}>상단 볼린저 밴드 (20, 2) 상회</Text>
        </View>
      )}

      {conditionData.lower && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>볼린저 밴드 약세 신호 경고</Text>
          <Text style={styles.desc}>하단 볼린저 밴드 (20, 2) 하회</Text>
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
