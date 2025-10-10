import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
} from "react-native-gesture-handler";
import Svg, { Circle, Line, Path, Polyline, Rect } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;
const CHART_HEIGHT = 240;
const VOLUME_HEIGHT = 80;
const RSI_HEIGHT = 70;
const TOTAL_HEIGHT = CHART_HEIGHT + VOLUME_HEIGHT + RSI_HEIGHT + 80;

// ===== 랜덤 데이터 생성기 =====
const generateCandles = (count: number, basePrice = 50000) => {
  const data = [];
  let price = basePrice;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 1000;
    const open = price;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 300;
    const low = Math.min(open, close) - Math.random() * 300;
    const volume = Math.floor(30 + Math.random() * 50);
    const rsi_14 = Math.floor(30 + Math.random() * 40);
    const alert = Math.random() < 0.05; // 5% 확률로 알림 발생
    price = close;
    data.push({ x: i + 1, open, close, high, low, volume, rsi_14, alert });
  }

  const calcSMA = (period: number) =>
    data.map((_, i) => {
      if (i < period) return data[i].close;
      const slice = data.slice(i - period, i);
      return slice.reduce((a, b) => a + b.close, 0) / slice.length;
    });

  const sma5 = calcSMA(5);
  const sma20 = calcSMA(20);

  const upper: number[] = [];
  const lower: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < 20) {
      upper.push(data[i].high);
      lower.push(data[i].low);
    } else {
      const slice = data.slice(i - 20, i);
      const mean = slice.reduce((a, b) => a + b.close, 0) / 20;
      const variance =
        slice.reduce((a, b) => a + (b.close - mean) ** 2, 0) / 20;
      const sd = Math.sqrt(variance);
      upper.push(mean + 2 * sd);
      lower.push(mean - 2 * sd);
    }
  }

  return data.map((d, i) => ({
    ...d,
    sma5: sma5[i],
    sma20: sma20[i],
    upper: upper[i],
    lower: lower[i],
  }));
};

export default function ChartDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [tab, setTab] = useState<"일봉" | "분봉">("일봉");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [alertInfo, setAlertInfo] = useState<any | null>(null);

  const dailyData = useMemo(() => generateCandles(300, 50000), []);
  const minuteData = useMemo(() => generateCandles(300, 53000), []);
  const data = tab === "일봉" ? dailyData : minuteData;

  const maxY = Math.max(...data.map((d) => d.high));
  const minY = Math.min(...data.map((d) => d.low));
  const scaleY = CHART_HEIGHT / (maxY - minY);

  const baseCandleWidth = 8;
  const candleWidth = baseCandleWidth * scale;
  const spacing = candleWidth * 0.6;
  const chartWidth = data.length * (candleWidth + spacing);

  const getY = (v: number) => (maxY - v) * scaleY;
  const makePath = (key: keyof (typeof data)[0]) =>
    data
      .map((d, i) => `${i * (candleWidth + spacing)},${getY(d[key])}`)
      .join(" L");

  const panRef = useRef(null);

  // 현재가 텍스트용 (마지막 종가)
  const latest = data[data.length - 1];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* === 상단 종목명 + 정보 === */}
        <Text style={styles.companyName}>{name}</Text>
        <Text style={styles.price}>{latest.close.toLocaleString()}원</Text>
        <Text style={styles.subText}>
          전일 대비{" "}
          <Text
            style={{
              color: latest.close >= latest.open ? "#D23F3F" : "#3CB043",
            }}
          >
            {latest.close >= latest.open ? "+" : ""}
            {(latest.close - latest.open).toFixed(0)}원 (
            {(((latest.close - latest.open) / latest.open) * 100).toFixed(2)}%)
          </Text>
        </Text>

        {/* === 탭 === */}
        <View style={styles.tabContainer}>
          {["일봉", "분봉"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.activeTab]}
              onPress={() => setTab(t as any)}
            >
              <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* === 차트 === */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <PinchGestureHandler
            onGestureEvent={(e) =>
              setScale(Math.max(0.5, Math.min(3, e.nativeEvent.scale)))
            }
          >
            <PanGestureHandler
              ref={panRef}
              onGestureEvent={(e) =>
                setOffset(
                  Math.max(
                    -chartWidth / 2,
                    Math.min(chartWidth / 2, e.nativeEvent.translationX)
                  )
                )
              }
            >
              <View>
                <Svg width={chartWidth} height={TOTAL_HEIGHT}>
                  {/* === 볼린저 밴드 === */}
                  <Path
                    d={`M${data
                      .map(
                        (d, i) =>
                          `${i * (candleWidth + spacing)},${getY(d.upper)}`
                      )
                      .join(" L")} L${data
                      .slice()
                      .reverse()
                      .map((d, i) => {
                        const x =
                          (data.length - 1 - i) * (candleWidth + spacing);
                        return `${x},${getY(d.lower)}`;
                      })
                      .join(" L")} Z`}
                    fill="rgba(100,100,255,0.1)"
                  />

                  {/* === SMA 라인 === */}
                  <Path
                    d={`M${makePath("sma20")}`}
                    stroke="#FF9E00"
                    strokeWidth={2}
                    fill="none"
                  />
                  <Path
                    d={`M${makePath("sma5")}`}
                    stroke="#00D5C0"
                    strokeWidth={1.5}
                    fill="none"
                  />

                  {/* === 캔들 === */}
                  {data.map((d, i) => {
                    const x = i * (candleWidth + spacing);
                    const yHigh = getY(d.high);
                    const yLow = getY(d.low);
                    const yOpen = getY(d.open);
                    const yClose = getY(d.close);
                    const isUp = d.close >= d.open;
                    const highlight = selected?.x === d.x;
                    return (
                      <React.Fragment key={i}>
                        <Line
                          x1={x + candleWidth / 2}
                          x2={x + candleWidth / 2}
                          y1={yHigh}
                          y2={yLow}
                          stroke={isUp ? "#E04E4E" : "#3CB043"}
                          strokeWidth={1.5}
                        />
                        <Rect
                          x={x}
                          y={isUp ? yClose : yOpen}
                          width={candleWidth}
                          height={Math.abs(yOpen - yClose) || 1}
                          fill={isUp ? "#E04E4E" : "#3CB043"}
                          rx={1.5}
                          stroke={highlight ? "#53A6FA" : "none"}
                          strokeWidth={highlight ? 2 : 0}
                          onPress={() => setSelected(d)}
                        />

                        {/* === 알림 점 === */}
                        {d.alert && (
                          <Circle
                            cx={x + candleWidth / 2}
                            cy={yHigh - 10}
                            r={4}
                            fill="#FFD700"
                            stroke="#000"
                            strokeWidth={1}
                            onPress={() =>
                              setAlertInfo({
                                x,
                                msg: `📢 ${tab} ${d.x}봉 알림 발생`,
                                value: d.close.toFixed(0),
                              })
                            }
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* === 거래량 === */}
                  {data.map((d, i) => {
                    const x = i * (candleWidth + spacing);
                    const volHeight = (d.volume / 100) * VOLUME_HEIGHT;
                    const y = CHART_HEIGHT + (VOLUME_HEIGHT - volHeight);
                    const isUp = d.close >= d.open;
                    return (
                      <Rect
                        key={`vol-${i}`}
                        x={x}
                        y={y}
                        width={candleWidth}
                        height={volHeight}
                        fill={isUp ? "#E04E4E" : "#3CB043"}
                        opacity={0.6}
                      />
                    );
                  })}

                  {/* === RSI === */}
                  {[30, 50, 70].map((v) => (
                    <Line
                      key={v}
                      x1={0}
                      x2={chartWidth}
                      y1={
                        CHART_HEIGHT +
                        VOLUME_HEIGHT +
                        (1 - v / 100) * RSI_HEIGHT
                      }
                      y2={
                        CHART_HEIGHT +
                        VOLUME_HEIGHT +
                        (1 - v / 100) * RSI_HEIGHT
                      }
                      stroke={
                        v === 50 ? "#aaa" : v === 70 ? "#E8395F" : "#00B0F0"
                      }
                      strokeDasharray="3,3"
                      strokeWidth={1}
                      opacity={0.6}
                    />
                  ))}
                  <Polyline
                    points={data
                      .map((d, i) => {
                        const x = i * (candleWidth + spacing);
                        const y =
                          CHART_HEIGHT +
                          VOLUME_HEIGHT +
                          (1 - d.rsi_14 / 100) * RSI_HEIGHT;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    stroke="#e75480"
                    strokeWidth={2}
                    fill="none"
                  />
                </Svg>
              </View>
            </PanGestureHandler>
          </PinchGestureHandler>
        </ScrollView>

        {/* === 지표 설명 Legend === */}
        <View style={styles.legendBox}>
          <Text style={styles.legend}>
            <Text style={{ color: "#00D5C0" }}>■</Text> SMA5
          </Text>
          <Text style={styles.legend}>
            <Text style={{ color: "#FF9E00" }}>■</Text> SMA20
          </Text>
          <Text style={styles.legend}>
            <Text style={{ color: "#6C8CFF" }}>■</Text> Bollinger
          </Text>
          <Text style={styles.legend}>
            <Text style={{ color: "#e75480" }}>■</Text> RSI
          </Text>
        </View>

        {/* === Tooltip === */}
        {selected && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipDate}>
              {tab} {selected.x}봉
            </Text>
            <Text style={styles.tooltipTitle}>상세 정보</Text>
            <Text>시가: {selected.open.toFixed(0)}</Text>
            <Text>고가: {selected.high.toFixed(0)}</Text>
            <Text>저가: {selected.low.toFixed(0)}</Text>
            <Text>종가: {selected.close.toFixed(0)}</Text>
            <Text>거래량: {selected.volume}</Text>
            <Text>RSI: {selected.rsi_14}</Text>
            <Text>SMA20: {selected.sma20.toFixed(0)}</Text>
          </View>
        )}

        {/* === 알림 팝업 === */}
        {alertInfo && (
          <View style={styles.alertBox}>
            <Text style={{ fontWeight: "700", color: "#FFD700" }}>
              {alertInfo.msg}
            </Text>
            <Text>종가: {alertInfo.value}원</Text>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  companyName: { fontSize: 20, fontWeight: "700" },
  price: { fontSize: 32, fontWeight: "800", marginTop: 6 },
  subText: { color: "#666", marginBottom: 20 },
  tabContainer: { flexDirection: "row", marginBottom: 10 },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTab: { backgroundColor: "#4CC53A", borderColor: "#4CC53A" },
  tabText: { fontSize: 15, color: "#333" },
  activeTabText: { color: "#fff", fontWeight: "600" },
  legendBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 5,
  },
  legend: { fontSize: 13, fontWeight: "500" },
  tooltip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    elevation: 4,
  },
  tooltipDate: { fontWeight: "700", fontSize: 16 },
  tooltipTitle: { fontWeight: "600", marginBottom: 8 },
  alertBox: {
    backgroundColor: "#1b1b1b",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
  },
});
