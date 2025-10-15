import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface VolumeConditionReadonlyCardProps {
  conditionData: {
    avgRise: string;
    avgDrop: string;
    spike: boolean;
    drop: boolean;
  } | null;
}

export default function VolumeConditionReadonlyCard({
  conditionData,
}: VolumeConditionReadonlyCardProps) {
  if (!conditionData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>거래량</Text>
      </View>

      <View style={styles.divider} />

      {/* 평균 거래량 대비 상승 */}
      {conditionData.avgRise && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>평균 거래량 대비 상승</Text>
          <Text style={styles.desc}>
            평균 대비 +{conditionData.avgRise}% 이상
          </Text>
        </View>
      )}

      {/* 평균 거래량 대비 하락 */}
      {conditionData.avgDrop && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>평균 거래량 대비 하락</Text>
          <Text style={styles.desc}>
            평균 대비 -{conditionData.avgDrop}% 이하
          </Text>
        </View>
      )}

      {/* 거래량 급증 경고 */}
      {conditionData.spike && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>거래량 급증 경고</Text>
          <Text style={styles.desc}>
            전일 대비 거래량이 20% 이상 증가 시 알림
          </Text>
        </View>
      )}

      {/* 거래량 감소 경고 */}
      {conditionData.drop && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>거래량 감소 경고</Text>
          <Text style={styles.desc}>
            전일 대비 거래량이 20% 이상 감소 시 알림
          </Text>
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
