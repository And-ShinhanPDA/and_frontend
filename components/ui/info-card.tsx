import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddIcon from "../../assets/images/add.svg";
import MinusIcon from "../../assets/images/minus.svg";

export default function InfoCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>현재 시점</Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          {expanded ? (
            <MinusIcon width={20} height={20} />
          ) : (
            <AddIcon width={20} height={20} />
          )}
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.subText}>11:38 기준</Text>
          <View style={styles.row}>
            <Text>현재가</Text>
            <Text>50,000원</Text>
          </View>
          <View style={styles.row}>
            <Text>시가</Text>
            <Text>50,000원</Text>
          </View>
          <Text style={styles.sectionTitle}>52주</Text>
          <View style={styles.row}>
            <Text>최고가</Text>
            <Text>50,000원</Text>
          </View>
          <View style={styles.row}>
            <Text>최저가</Text>
            <Text>50,000원</Text>
          </View>
          <View style={styles.row}>
            <Text>거래량</Text>
            <Text>50</Text>
          </View>
          <Text style={styles.sectionTitle}>볼린저밴드 (20, 2)</Text>
          <View style={styles.row}>
            <Text>상단</Text>
            <Text>50,000원</Text>
          </View>
          <View style={styles.row}>
            <Text>하단</Text>
            <Text>50,000원</Text>
          </View>
          <View style={styles.row}>
            <Text>RSI (14일 기준)</Text>
            <Text>50</Text>
          </View>
          <View style={styles.row}>
            <Text>이동평균선</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 10,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    marginTop: 8,
  },
  subText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
});
