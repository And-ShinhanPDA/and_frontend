import { CONDITION_DESCRIPTIONS } from "@/constants/conditionDescriptions";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ConditionTooltip from "../../condition/condition-tooltip";

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>볼린저밴드</Text>
          <ConditionTooltip
            description={CONDITION_DESCRIPTIONS.bollingerband}
          />
        </View>
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
