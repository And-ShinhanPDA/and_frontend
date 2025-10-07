import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Condition = {
  id: number;
  name: string;
  count: number;
};
// 추후 실제 데이터로 교체 필요
const sampleConditions: Condition[] = [
  { id: 1, name: "알림1", count: 3 },
  { id: 2, name: "알림2", count: 4 },
  { id: 3, name: "알림3", count: 1 },
];

export default function ActivatedConditionCard({
  data = sampleConditions,
}: {
  data?: Condition[];
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>활성화 된 조건 알림</Text>

      {data.map((item) => (
        <View style={styles.row} key={item.id}>
          <View style={styles.left}>
            <View style={styles.dot} />
            <Text style={styles.name}>{item.name}</Text>
          </View>
          <Text style={styles.count}>{item.count}개 활성화</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#21C55D",
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    color: "#111",
  },
  count: {
    fontSize: 14,
    color: "#333",
  },
});
