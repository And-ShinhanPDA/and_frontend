import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import ChartHeader, { Candle } from "./chart-header";
import { chartHtml } from "./chart-html";
type Period = "5m" | "1D" | "1W";
const fmt = (n?: number) =>
  typeof n === "number" ? Math.round(n).toLocaleString() : "-";
const ymd = (sec?: number) =>
  sec ? new Date(sec * 1000).toLocaleDateString() : "-";
const weekday = (sec?: number) =>
  sec
    ? ["일", "월", "화", "수", "목", "금", "토"][new Date(sec * 1000).getDay()]
    : "-";

const genCandles = (period: Period, count: number, base = 79200): Candle[] => {
  const out: Candle[] = [];
  const step =
    period === "5m"
      ? 60 * 5
      : period === "1D"
      ? 60 * 60 * 24
      : 60 * 60 * 24 * 7;
  const now = Math.floor(Date.now() / 1000);
  let price = base;
  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * step;
    const change = (Math.random() - 0.5) * (period === "5m" ? 200 : 1000);
    const open = price;
    const close = Math.max(100, open + change);
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    const volume = Math.floor(20 + Math.random() * 500);
    out.push({ time: t, open, high, low, close, volume });
    price = close;
  }
  return out;
};

export default function ChartScreen({ companyName }: { companyName: string }) {
  const [period, setPeriod] = useState<Period>("1D");
  const [smaOn, setSmaOn] = useState({
    sma5: true,
    sma20: true,
    sma60: true,
    sma120: true,
  });
  const [ohlc, setOhlc] = useState<Candle | null>(null);
  const [smaVals, setSmaVals] = useState<any>({});
  const [headerAlert, setHeaderAlert] = useState<string | null>(null);

  const data = useMemo(() => genCandles(period, 250, 79200), [period]);

  const webRef = useRef<WebView>(null);

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const currPrice = ohlc?.close ?? last?.close;
  const prevClose = prev?.close ?? last?.open;
  const diff = (currPrice ?? 0) - (prevClose ?? 0);
  const diffPct = prevClose
    ? (((currPrice ?? 0) - prevClose) / prevClose) * 100
    : 0;
  const isUp = diff >= 0;

  const SMA_META = {
    sma5: { label: "5", line: "#FF8A80", chipBg: "#FFEBEE", chipOn: "#C62828" }, // 파스텔 레드
    sma20: {
      label: "20",
      line: "#90CAF9",
      chipBg: "#E3F2FD",
      chipOn: "#1565C0",
    },
    sma60: {
      label: "60",
      line: "#B39DDB",
      chipBg: "#F3E5F5",
      chipOn: "#6A1B9A",
    },
    sma120: {
      label: "120",
      line: "#FFCC80",
      chipBg: "#FFF3E0",
      chipOn: "#EF6C00",
    },
  } as const;

  useEffect(() => {
    webRef.current?.postMessage(
      JSON.stringify({ type: "setAll", payload: { period, data, smaOn } })
    );
  }, [period, data, smaOn]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "crosshair") {
        setOhlc(msg.payload.candle ?? null);
        setSmaVals(msg.payload.sma ?? {});
        setHeaderAlert(msg.payload.alert ?? null);
      }
    } catch {}
  };

  const toggle = (k: keyof typeof smaOn) =>
    setSmaOn((prev) => ({ ...prev, [k]: !prev[k] }));
  const changePeriod = (p: Period) => setPeriod(p);

  const header = ohlc ?? data[data.length - 1];

  return (
    <View style={styles.container}>
      <ChartHeader
        companyName={companyName}
        ohlc={ohlc ?? data[data.length - 1]}
        smaVals={smaVals}
        headerAlert={headerAlert}
        fmt={fmt}
        ymd={ymd}
        weekday={weekday}
        diff={diff}
        diffPct={diffPct}
        isUp={isUp}
        currPrice={currPrice}
      />

      {/* SMA 토글 버튼 */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toggleBar}
      >
        {(
          [
            { key: "sma5", meta: SMA_META.sma5 },
            { key: "sma20", meta: SMA_META.sma20 },
            { key: "sma60", meta: SMA_META.sma60 },
            { key: "sma120", meta: SMA_META.sma120 },
          ] as const
        ).map(({ key, meta }) => {
          const on = smaOn[key as keyof typeof smaOn];
          return (
            <Pressable
              key={key}
              onPress={() => toggle(key as keyof typeof smaOn)}
              style={[
                styles.chip,
                { borderColor: on ? meta.line : "#D9D9D9" },
                on ? { backgroundColor: meta.chipBg } : styles.chipOff,
              ]}
            >
              <Text
                style={{ color: on ? meta.chipOn : "#666", fontWeight: "700" }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* WebView */}
      <View style={{ flex: 1, minHeight: 350 }}>
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html: chartHtml }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          style={{ flex: 1, backgroundColor: "#ffffff" }}
        />
      </View>

      {/* 기간 버튼 */}
      <View style={styles.periodBar}>
        {(["5m", "1D", "1W"] as Period[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => changePeriod(p)}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
          >
            <Text
              style={[
                styles.periodText,
                period === p && styles.periodTextActive,
              ]}
            >
              {p === "5m" ? "5분" : p === "1D" ? "일" : "주"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

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

  toggleBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: "#fff",
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    minWidth: 44,
    alignItems: "center",
  },
  chipOn: { backgroundColor: "#E8F9E5" },
  chipOff: { backgroundColor: "#FFFFFF" },

  periodBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  periodBtnActive: { backgroundColor: "#E8F9E5" },
  periodText: { color: "#666", fontWeight: "700" },
  periodTextActive: { color: "#2C8A2C" },
});
