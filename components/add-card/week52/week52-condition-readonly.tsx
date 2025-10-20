import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Week52ConditionReadonlyCardProps {
  conditionData: {
    highAlert: boolean;
    lowAlert: boolean;
    highProximity: { value: number } | null;
    lowProximity: { value: number } | null;
  } | null;
}

export default function Week52ConditionReadonlyCard({
  conditionData,
}: Week52ConditionReadonlyCardProps) {
  if (!conditionData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>52주</Text>
      </View>

      <View style={styles.divider} />

      {/* 최고가 경보 */}
      {conditionData.highAlert && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>52주 최고가 경보</Text>
          <Text style={styles.desc}>최고가 갱신</Text>
        </View>
      )}

      {/* 최고가 근접 */}
      {conditionData.highProximity?.value && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>52주 최고가 근접</Text>
          <Text style={styles.desc}>
            근접 기준 {conditionData.highProximity.value}%
          </Text>
        </View>
      )}

      {/* 최저가 경보 */}
      {conditionData.lowAlert && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>52주 최저가 경보</Text>
          <Text style={styles.desc}>최저가 갱신</Text>
        </View>
      )}

      {/* 최저가 근접 */}
      {conditionData.lowProximity?.value && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>52주 최저가 근접</Text>
          <Text style={styles.desc}>
            근접 기준 {conditionData.lowProximity.value}%
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
