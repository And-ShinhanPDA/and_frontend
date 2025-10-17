import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi14?: number;
  diffFromPrev?: number;
};

export type SmaVals = {
  sma5?: number;
  sma10?: number;
  sma20?: number;
  sma30?: number;
  sma50?: number;
  sma60?: number;
  sma100?: number;
  sma120?: number;
  sma200?: number;
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
          <Text style={styles.kv}>
            거래량 <Text style={styles.bold}>{fmt(ohlc?.volume)}</Text>
          </Text>
          <Text style={styles.kv}>
            RSI{" "}
            <Text style={styles.bold}>
              {ohlc?.rsi14 ? ohlc.rsi14.toFixed(2) : "-"}
            </Text>
          </Text>
        </View>
        <View style={[styles.row, { marginTop: 2 }]}>
          <Text style={styles.kv}>
            전일대비{" "}
            <Text
              style={[
                styles.bold,
                {
                  color: (ohlc?.diffFromPrev ?? 0) >= 0 ? "#4CC439" : "#EF5350",
                },
              ]}
            >
              {ohlc?.diffFromPrev
                ? `${ohlc.diffFromPrev >= 0 ? "+" : ""}${fmt(
                    ohlc.diffFromPrev
                  )}`
                : "-"}
            </Text>
          </Text>
        </View>
        {/* SMA 값 표시 (값이 있을 때만) */}
        {(smaVals.sma5 || smaVals.sma10 || smaVals.sma20 || smaVals.sma30) && (
          <View style={[styles.row, { marginTop: 8 }]}>
            {smaVals.sma5 && (
              <Text
                style={{ color: "#FF8A80", fontWeight: "600", fontSize: 12 }}
              >
                5 {fmt(smaVals.sma5)}
              </Text>
            )}
            {smaVals.sma10 && (
              <Text
                style={{ color: "#FFA726", fontWeight: "600", fontSize: 12 }}
              >
                10 {fmt(smaVals.sma10)}
              </Text>
            )}
            {smaVals.sma20 && (
              <Text
                style={{ color: "#90CAF9", fontWeight: "600", fontSize: 12 }}
              >
                20 {fmt(smaVals.sma20)}
              </Text>
            )}
            {smaVals.sma30 && (
              <Text
                style={{ color: "#66BB6A", fontWeight: "600", fontSize: 12 }}
              >
                30 {fmt(smaVals.sma30)}
              </Text>
            )}
          </View>
        )}
        {(smaVals.sma50 ||
          smaVals.sma60 ||
          smaVals.sma100 ||
          smaVals.sma200) && (
          <View style={[styles.row, { marginTop: 2 }]}>
            {smaVals.sma50 && (
              <Text
                style={{ color: "#AB47BC", fontWeight: "600", fontSize: 12 }}
              >
                50 {fmt(smaVals.sma50)}
              </Text>
            )}
            {smaVals.sma60 && (
              <Text
                style={{ color: "#B39DDB", fontWeight: "600", fontSize: 12 }}
              >
                60 {fmt(smaVals.sma60)}
              </Text>
            )}
            {smaVals.sma100 && (
              <Text
                style={{ color: "#FFCC80", fontWeight: "600", fontSize: 12 }}
              >
                100 {fmt(smaVals.sma100)}
              </Text>
            )}
            {smaVals.sma200 && (
              <Text
                style={{ color: "#A1887F", fontWeight: "600", fontSize: 12 }}
              >
                200 {fmt(smaVals.sma200)}
              </Text>
            )}
          </View>
        )}
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
