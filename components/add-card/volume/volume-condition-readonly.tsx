import { CONDITION_DESCRIPTIONS } from "@/constants/conditionDescriptions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ConditionTooltip from "../../condition/condition-tooltip";

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>거래량</Text>
          <ConditionTooltip description={CONDITION_DESCRIPTIONS.volume} />
        </View>
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
