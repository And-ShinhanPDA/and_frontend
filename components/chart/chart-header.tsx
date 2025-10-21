import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 유틸리티 함수들
const fmt = (n?: number) =>
  typeof n === "number" ? Math.round(n).toLocaleString() : "-";
const ymd = (sec?: number | string) => {
  if (!sec) return "-";
  try {
    let date: Date;
    if (typeof sec === "string") {
      // 문자열인 경우 (예: "2025-10-21")
      date = new Date(sec);
    } else if (typeof sec === "number") {
      // 숫자인 경우 (타임스탬프)
      date = new Date(sec * 1000);
    } else {
      return "-";
    }

    if (isNaN(date.getTime())) return "-";

    // 한국어 형식으로 포맷 (예: 2025년 10월 21일)
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  } catch (e) {
    console.log("[ChartHeader] ymd error:", e, "sec:", sec);
    return "-";
  }
};
const weekday = (sec?: number | string) => {
  if (!sec) return "-";
  try {
    let date: Date;
    if (typeof sec === "string") {
      // 문자열인 경우 (예: "2025-10-21")
      date = new Date(sec);
    } else if (typeof sec === "number") {
      // 숫자인 경우 (타임스탬프)
      date = new Date(sec * 1000);
    } else {
      return "-";
    }

    if (isNaN(date.getTime())) return "-";
    return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  } catch (e) {
    console.log("[ChartHeader] weekday error:", e, "sec:", sec);
    return "-";
  }
};
const formatTime = (sec?: number | string) => {
  if (!sec) return "";
  try {
    let date: Date;
    if (typeof sec === "string") {
      date = new Date(sec);
    } else if (typeof sec === "number") {
      date = new Date(sec * 1000);
    } else {
      return "";
    }

    if (isNaN(date.getTime())) return "";

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (e) {
    console.log("[ChartHeader] formatTime error:", e, "sec:", sec);
    return "";
  }
};

export type Candle = {
  time: number | string;
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
  headerAlerts: any[];
  fmt: (n?: number) => string;
  ymd: (sec?: number | string) => string;
  weekday: (sec?: number | string) => string;
  formatTime: (sec?: number | string) => string;
  diff: number;
  diffPct: number;
  isUp: boolean;
  currPrice?: number;
  period?: string; // 1D 또는 1M
};

export default function ChartHeader({
  companyName,
  ohlc,
  smaVals,
  headerAlert,
  headerAlerts = [],
  fmt,
  ymd,
  weekday,
  formatTime,
  diff,
  diffPct,
  isUp,
  currPrice,
  period = "1D",
}: ChartHeaderProps) {
  const [showModal, setShowModal] = useState(false);
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
          {period === "1m"
            ? `${ymd(ohlc?.time)} (${weekday(ohlc?.time)}) ${formatTime(
                ohlc?.time
              )}`
            : `${ymd(ohlc?.time)} (${weekday(ohlc?.time)})`}
        </Text>
        <View style={styles.row}>
          <Text style={styles.kv}>
            {period === "1D" ? "시가" : "시작"}{" "}
            <Text style={styles.bold}>{fmt(ohlc?.open)}</Text>
          </Text>
          <Text style={styles.kv}>
            최고 <Text style={styles.bold}>{fmt(ohlc?.high)}</Text>
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.kv}>
            {period === "1D" ? "종가" : "마지막"}{" "}
            <Text style={styles.bold}>{fmt(ohlc?.close)}</Text>
          </Text>
          <Text style={styles.kv}>
            최저 <Text style={styles.bold}>{fmt(ohlc?.low)}</Text>
          </Text>
        </View>
        {/* 일봉일 때만 거래량, RSI, 전일대비 표시 */}
        {period === "1D" && (
          <>
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
                      color:
                        (ohlc?.diffFromPrev ?? 0) >= 0 ? "#4CC439" : "#EF5350",
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
          </>
        )}
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
        {headerAlerts.length > 0 && (
          <View style={styles.alertBox}>
            <View style={styles.alertTitleRow}>
              <Text style={styles.alertTitle}>
                알림 ({headerAlerts.length}개)
              </Text>
              {headerAlerts.length > 2 ? (
                <Pressable
                  style={styles.showMoreButton}
                  onPress={() => setShowModal(true)}
                >
                  <Text style={styles.showMoreText}>더보기</Text>
                </Pressable>
              ) : (
                <View style={styles.showMoreButtonPlaceholder} />
              )}
            </View>
            <View style={styles.alertContainer}>
              {headerAlerts.slice(0, 2).map((alert, index) => (
                <View key={alert.id || index} style={styles.alertItem}>
                  <Text style={styles.alertItemText} numberOfLines={1}>
                    {alert.alertContent || "조건 충족"}
                  </Text>
                  <Text style={styles.alertItemTime}>
                    {alert.timeStr || ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 알림 모달 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                알림 목록 ({headerAlerts.length}개)
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {headerAlerts.map((alert, index) => (
                <View key={alert.id || index} style={styles.modalAlertItem}>
                  <Text style={styles.modalAlertText}>
                    {alert.alertContent || "조건 충족"}
                  </Text>
                  <Text style={styles.modalAlertTime}>
                    {alert.timeStr || ""}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F8FFF3",
    borderWidth: 1,
    borderColor: "#CFEFCC",
  },
  alertTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    minHeight: 24,
  },
  alertTitle: {
    color: "#2C8A2C",
    fontWeight: "800",
    fontSize: 14,
  },
  alertContainer: {
    gap: 2,
    minHeight: 42,
  },
  alertItem: {
    paddingVertical: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  alertItemTitle: {
    color: "#1B5E20",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  alertItemContent: {
    color: "#2C2C2C",
    fontSize: 12,
    marginBottom: 2,
  },
  alertItemTime: {
    color: "#666",
    fontSize: 11,
    flexShrink: 0,
    marginLeft: 4,
  },
  showMoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  showMoreButtonPlaceholder: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    opacity: 0,
  },
  showMoreText: {
    color: "#2C8A2C",
    fontSize: 11,
    fontWeight: "600",
  },
  alertItemText: {
    color: "#2C2C2C",
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C8A2C",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  modalScrollView: {
    maxHeight: 400,
    padding: 16,
  },
  modalAlertItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: "#F8FFF3",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#2C8A2C",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  modalAlertText: {
    color: "#2C2C2C",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  modalAlertTime: {
    color: "#666",
    fontSize: 12,
    flexShrink: 0,
    marginLeft: 4,
  },
});
