import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  sma: { [key: string]: number };
  onRefresh?: () => void;
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
  sma,
  onRefresh,
}: CurrentStatusCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle}>현재 시점</Text>
          <Text style={styles.subText}>{time}</Text>
          {onRefresh && (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Image
                source={require("../../assets/images/resetIcon.png")}
                style={styles.refreshIcon}
              />
            </TouchableOpacity>
          )}
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
          </View>
          <View style={styles.maGrid}>
            {Object.entries(sma).map(([period, value]) => (
              <View key={period} style={styles.maItem}>
                <Text style={styles.subLabel}>{period}</Text>
                <Text style={styles.value}>{value.toLocaleString()}원</Text>
              </View>
            ))}
          </View>
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
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
    marginRight: 6,
  },
  subText: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Pretendard",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: -16,
  },
  content: {
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 4,
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 4,
  },

  mainLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Pretendard",
  },
  subLabel: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Pretendard",
  },
  value: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  maGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
  maItem: {
    width: "47%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  refreshIcon: {
    width: 16,
    height: 16,
  },
});
