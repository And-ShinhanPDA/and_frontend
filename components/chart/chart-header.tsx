import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type SmaVals = {
  sma5?: number;
  sma20?: number;
  sma60?: number;
  sma120?: number;
};

type ChartHeaderProps = {
  companyName: string;
  ohlc: Candle | null;
  smaVals: SmaVals;
  headerAlert: string | null;
  fmt: (n?: number) => string;
  ymd: (sec?: number) => string;
  weekday: (sec?: number) => string;
  diff: number;
  diffPct: number;
  isUp: boolean;
  currPrice?: number;
};

export default function ChartHeader({
  companyName,
  ohlc,
  smaVals,
  headerAlert,
  fmt,
  ymd,
  weekday,
  diff,
  diffPct,
  isUp,
  currPrice,
}: ChartHeaderProps) {
  return (
    <>
      {/* 상단 기업 정보 */}
      <View style={styles.priceHeader}>
        <Text style={styles.company}>{companyName}</Text>
        <Text style={styles.price}>{fmt(currPrice)}원</Text>
        <Text style={[styles.diff, { color: isUp ? "#4CC439" : "#EF5350" }]}>
          {isUp ? "+" : ""}
          {fmt(diff)}원 (
          {isNaN(diffPct)
            ? "-"
            : `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}%`}
          )
        </Text>
      </View>

      {/* 날짜, 시가/종가/고가/저가, SMA, 알림 */}
      <View style={styles.metaHeader}>
        <Text style={styles.date}>
          {ymd(ohlc?.time)} ({weekday(ohlc?.time)})
        </Text>
        <View style={styles.row}>
          <Text style={styles.kv}>
            시작 <Text style={styles.bold}>{fmt(ohlc?.open)}</Text>
          </Text>
          <Text style={styles.kv}>
            최고 <Text style={styles.bold}>{fmt(ohlc?.high)}</Text>
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.kv}>
            마지막 <Text style={styles.bold}>{fmt(ohlc?.close)}</Text>
          </Text>
          <Text style={styles.kv}>
            최저 <Text style={styles.bold}>{fmt(ohlc?.low)}</Text>
          </Text>
        </View>
        <View style={[styles.row, { marginTop: 6 }]}>
          <Text style={{ color: "#9EE493", fontWeight: "600" }}>
            5 {fmt(smaVals.sma5)}
          </Text>
          <Text style={{ color: "#6ACE5A", fontWeight: "600" }}>
            20 {fmt(smaVals.sma20)}
          </Text>
          <Text style={{ color: "#4CC439", fontWeight: "600" }}>
            60 {fmt(smaVals.sma60)}
          </Text>
          <Text style={{ color: "#A9A9A9", fontWeight: "600" }}>
            120 {fmt(smaVals.sma120)}
          </Text>
        </View>
        {headerAlert && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>🔔 알림</Text>
            <Text style={styles.alertText}>{headerAlert}</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  priceHeader: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  company: { fontSize: 16, fontWeight: "800", color: "#333" },
  price: { fontSize: 28, fontWeight: "900", color: "#111", marginTop: 2 },
  diff: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  metaHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    backgroundColor: "#ffffff",
  },
  date: { color: "#666", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  kv: { color: "#444" },
  bold: { fontWeight: "800", color: "#111" },
  alertBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#F8FFF3",
    borderWidth: 1,
    borderColor: "#CFEFCC",
  },
  alertTitle: { color: "#2C8A2C", fontWeight: "800", marginBottom: 4 },
  alertText: { color: "#2C2C2C", fontSize: 12 },
});
