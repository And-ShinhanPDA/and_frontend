import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChevronDown from "../../assets/images/ChevronDown.svg";

interface CurrentStatusCardProps {
  time: string;
  currentPrice: number;
  openPrice: number;
  high52w: number;
  low52w: number;
  volume: number;
  bollingerUpper: number;
  bollingerLower: number;
  rsi: number;
  movingAverage: number;
}

export default function CurrentStatusCard({
  time,
  currentPrice,
  openPrice,
  high52w,
  low52w,
  volume,
  bollingerUpper,
  bollingerLower,
  rsi,
  movingAverage,
}: CurrentStatusCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>현재 시점</Text>
          <Text style={styles.subText}>{time}</Text>
        </View>

        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <View
            style={[
              styles.iconWrapper,
              expanded && { transform: [{ rotate: "180deg" }] },
            ]}
          >
            <ChevronDown width={18} height={18} />
          </View>
        </TouchableOpacity>
      </View>

      {expanded && <View style={styles.divider} />}

      {expanded && (
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.mainLabel}>현재가</Text>
            <Text style={styles.value}>{currentPrice.toLocaleString()}원</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.mainLabel}>시가</Text>
            <Text style={styles.value}>{openPrice.toLocaleString()}원</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.mainLabel}>52주</Text>
          </View>

          <View style={styles.subRow}>
            <Text style={styles.subLabel}>최고가</Text>
            <Text style={styles.value}>{high52w.toLocaleString()}원</Text>
          </View>

          <View style={styles.subRow}>
            <Text style={styles.subLabel}>최저가</Text>
            <Text style={styles.value}>{low52w.toLocaleString()}원</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.mainLabel}>거래량</Text>
            <Text style={styles.value}>{volume.toLocaleString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.mainLabel}>볼린저밴드 (20, 2)</Text>
          </View>

          <View style={styles.subRow}>
            <Text style={styles.subLabel}>상단</Text>
            <Text style={styles.value}>
              {bollingerUpper.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.subRow}>
            <Text style={styles.subLabel}>하단</Text>
            <Text style={styles.value}>
              {bollingerLower.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.mainLabel}>RSI (14일 기준)</Text>
            <Text style={styles.value}>{rsi}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.mainLabel}>이동평균선</Text>
            {/* <Text style={styles.value}>{movingAverage}</Text> */}
            {/* 이동평균선 값은 어떻게 표현할지 안나와있음 */}
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
    paddingVertical: 10,
    paddingHorizontal: 12,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  subText: {
    fontSize: 13,
    color: "#777",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: -12,
  },
  content: {
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  mainLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  subLabel: {
    fontSize: 13,
    color: "#595959",
  },
  value: {
    fontSize: 15,
    color: "#000",
  },
});
