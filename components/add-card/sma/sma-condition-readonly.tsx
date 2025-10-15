import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
        <Text style={styles.title}>SMA</Text>
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
