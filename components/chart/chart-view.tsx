import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { chartService } from "@/services/chart-service";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import ChartHeader, { Candle } from "./chart-header";
import { chartHtml } from "./chart-html";

type Period = "1m" | "1D";
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
  const step = period === "1m" ? 60 : 60 * 60 * 24;
  const now = Math.floor(Date.now() / 1000);
  let price = base;
  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * step;
    const change = (Math.random() - 0.5) * (period === "1m" ? 200 : 1000);
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

export default function ChartScreen({
  companyName,
  stockCode,
  onPriceUpdate,
}: {
  companyName: string;
  stockCode: string;
  onPriceUpdate?: (price: any) => void;
}) {
  // console.log("[차트] ChartScreen 컴포넌트 렌더링됨:", {
  //   companyName,
  //   stockCode,
  // });
  const { accessToken } = useAuth();
  const [period, setPeriod] = useState<Period>("1D");
  const [smaOn, setSmaOn] = useState({
    sma5: true,
    sma10: true,
    sma20: true,
    sma30: true,
    sma50: true,
    sma60: true,
    sma100: true,
    sma200: true,
  });
  const [bollingerOn, setBollingerOn] = useState(true);
  const [ohlc, setOhlc] = useState<Candle | null>(null);
  const [smaVals, setSmaVals] = useState<any>({});
  const [headerAlert, setHeaderAlert] = useState<string | null>(null);
  const [headerAlerts, setHeaderAlerts] = useState<any[]>([]);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [alertHistoryMarkers, setAlertHistoryMarkers] = useState<any[]>([]);
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCandle, setLastCandle] = useState<Candle | null>(null);
  const [currentPrice, setCurrentPrice] = useState<any>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  const data = useMemo(() => genCandles(period, 250, 79200), [period]);

  const webRef = useRef<WebView>(null);

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  // currentPrice가 있으면 우선 사용, 없으면 ohlc?.close ?? last?.close 사용
  const currPrice = currentPrice?.currentPrice ?? ohlc?.close ?? last?.close;
  const prevClose = prev?.close ?? last?.open;
  const diff = currentPrice?.diff ?? (currPrice ?? 0) - (prevClose ?? 0);
  const diffPct =
    currentPrice?.diffRate ??
    (prevClose ? (((currPrice ?? 0) - prevClose) / prevClose) * 100 : 0);
  const isUp = diff >= 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webViewLoadedRef = useRef(webViewLoaded);
  const periodRef = useRef(period);
  const smaOnRef = useRef(smaOn);
  const bollingerOnRef = useRef(bollingerOn);
  const alertHistoryMarkersRef = useRef(alertHistoryMarkers);

  // ref 값들을 최신으로 유지
  useEffect(() => {
    webViewLoadedRef.current = webViewLoaded;
  }, [webViewLoaded]);

  useEffect(() => {
    periodRef.current = period;
  }, [period]);

  useEffect(() => {
    smaOnRef.current = smaOn;
  }, [smaOn]);

  useEffect(() => {
    bollingerOnRef.current = bollingerOn;
  }, [bollingerOn]);

  useEffect(() => {
    alertHistoryMarkersRef.current = alertHistoryMarkers;
  }, [alertHistoryMarkers]);
  const SMA_META = {
    sma5: { label: "5", line: "#FF8A80", chipBg: "#FFEBEE", chipOn: "#FF8A80" }, // 차트 선과 동일
    sma10: {
      label: "10",
      line: "#81C784",
      chipBg: "#E8F5E8",
      chipOn: "#81C784",
    }, // 차트 선과 동일
    sma20: {
      label: "20",
      line: "#90CAF9",
      chipBg: "#E3F2FD",
      chipOn: "#90CAF9",
    }, // 차트 선과 동일
    sma30: {
      label: "30",
      line: "#FFB74D",
      chipBg: "#FFF3E0",
      chipOn: "#FFB74D",
    }, // 차트 선과 동일
    sma50: {
      label: "50",
      line: "#BA68C8",
      chipBg: "#F3E5F5",
      chipOn: "#BA68C8",
    }, // 차트 선과 동일
    sma60: {
      label: "60",
      line: "#B39DDB",
      chipBg: "#F3E5F5",
      chipOn: "#B39DDB",
    }, // 차트 선과 동일
    sma100: {
      label: "100",
      line: "#FFCC80",
      chipBg: "#FFF3E0",
      chipOn: "#FFCC80",
    }, // 차트 선과 동일
    sma200: {
      label: "200",
      line: "#A5D6A7",
      chipBg: "#E8F5E8",
      chipOn: "#A5D6A7",
    }, // 차트 선과 동일
  } as const;

  const BOLLINGER_META = {
    label: "BB",
    line: "rgba(0,0,0,0.25)",
    chipBg: "#F5F5F5",
    chipOn: "rgba(0,0,0,0.25)",
  };

  // 일봉 데이터 fetch
  const fetchDailyData = async () => {
    try {
      const result = await chartService.getDailyCandles(stockCode);
      setCandles(result);

      // 마지막 캔들 데이터 저장
      if (result.length > 0) {
        const lastData = result[result.length - 1];
        setLastCandle({
          time: new Date(lastData.time).getTime() / 1000,
          open: lastData.open,
          high: lastData.high,
          low: lastData.low,
          close: lastData.close,
          volume: lastData.volume,
          rsi14: lastData.rsi14,
          diffFromPrev: lastData.diffFromPrev,
        });
      }
    } catch (err) {
      console.error("일봉 데이터 불러오기 실패:", err);
    }
  };

  // 분봉 데이터 fetch
  const fetchMinuteData = useCallback(async () => {
    try {
      const result = await chartService.getMinuteCandles(stockCode);
      setCandles(result);

      // 마지막 캔들 데이터 저장
      if (result.length > 0) {
        const lastData = result[result.length - 1];
        setLastCandle({
          time: lastData.time,
          open: lastData.open,
          high: lastData.high,
          low: lastData.low,
          close: lastData.close,
          volume: lastData.volume,
          rsi14: lastData.rsi14,
          diffFromPrev: lastData.diffFromPrev,
        });
      }
    } catch (err) {
      console.error("분봉 데이터 불러오기 실패:", err);
    }
  }, [stockCode]);

  // 현재가 fetch
  const fetchCurrentPrice = useCallback(async () => {
    console.log("🔄 fetchCurrentPrice 함수 시작", { stockCode });
    try {
      console.log("API 호출 시작");
      const result = await chartService.getCurrentPrice(stockCode);
      console.log("API 응답 받음:", result);

      setCurrentPrice(result);

      // 부모 컴포넌트로 현재가 전달
      if (onPriceUpdate) {
        onPriceUpdate(result);
      }

      // 강제 리렌더링 트리거
      setForceUpdate((prev) => {
        return prev + 1;
      });

      console.log("현재가 업데이트 완료:", {
        price: result.currentPrice,
        diff: result.diff,
        diffRate: result.diffRate,
        forceUpdate: forceUpdate + 1,
        period: period,
        displayPrice: result.currentPrice,
        displayDiff: result.diff,
        displayDiffPct: result.diffRate,
      });
    } catch (err) {
      console.error("현재가 조회 실패:", err);
    }
  }, [stockCode, onPriceUpdate]);

  // 초기 데이터 로드 및 period 변경 시
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (period === "1D") {
          await fetchDailyData();
        } else if (period === "1m") {
          await fetchMinuteData();
        }
        await fetchCurrentPrice();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stockCode, period]);

  // 알림 히스토리 가져오기 (일봉일 때만)
  useEffect(() => {
    console.log("[차트] useEffect 실행됨:", {
      accessToken: !!accessToken,
      stockCode,
      period,
    });

    const fetchAlertHistory = async () => {
      console.log("[차트] 알림 히스토리 fetch 시작:", {
        accessToken: !!accessToken,
        stockCode,
        period,
      });

      if (!accessToken || !stockCode || period !== "1D") {
        console.log("[차트] 알림 히스토리 fetch 조건 불만족:", {
          accessToken: !!accessToken,
          stockCode,
          period,
        });
        setAlertHistoryMarkers([]);
        return;
      }

      try {
        console.log("[차트] alertService.getAlertHistory 호출:", stockCode);
        const history = await alertService.getAlertHistory(
          accessToken,
          stockCode
        );
        //console.log("[차트] 알림 히스토리 API 응답:", history);

        // 날짜별로 그룹화하여 하루에 하나의 마커만 표시
        const groupedByDate: { [key: string]: any[] } = {};

        history.forEach((item: any) => {
          const date = new Date(item.createdAt);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");

          const dateKey = `${year}-${month}-${day}`;
          const timeStr = `${hours}:${minutes}`;

          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
          }

          groupedByDate[dateKey].push({
            time: dateKey,
            alertContent: item.indicatorSnapshot || "조건 충족",
            timeStr,
            id: item.id,
            alertId: item.alertId,
            createdAt: item.createdAt,
          });
        });

        // 날짜별로 그룹화된 마커 생성 (하루에 하나의 점만)
        const markers = Object.entries(groupedByDate).map(
          ([dateKey, alerts]) => {
            const firstAlert = alerts[0];
            const alertCount = alerts.length;

            return {
              time: dateKey,
              alertText:
                alertCount > 1
                  ? `${alertCount}개 알림`
                  : firstAlert.alertContent,
              alertTitle: "알림",
              alertContent: firstAlert.alertContent,
              timeStr: firstAlert.timeStr,
              id: firstAlert.id,
              alertId: firstAlert.alertId,
              alertCount,
              allAlerts: alerts, // 모든 알림 데이터 저장
            };
          }
        );

        // console.log(
        //   `[차트] 알림 히스토리 마커 ${markers.length}개 로드 완료 (원본 ${history.length}개에서 그룹화)`
        // );
        // //console.log("[차트] 마커 데이터:", markers);
        setAlertHistoryMarkers(markers);
      } catch (err) {
        console.error("알림 히스토리 조회 실패:", err);
        setAlertHistoryMarkers([]);
      }
    };

    fetchAlertHistory();
  }, [accessToken, stockCode, period]);

  // 강제로 알림 히스토리 fetch (테스트용)
  useEffect(() => {
    console.log("[차트] 강제 useEffect 실행됨!");
    const testFetch = async () => {
      if (!accessToken) {
        console.log("[차트] accessToken이 없어서 강제 fetch 건너뜀");
        return;
      }
      console.log("[차트] 강제 fetch 시작!");
      try {
        const history = await alertService.getAlertHistory(
          accessToken,
          stockCode
        );
        console.log("[차트] 강제 fetch 결과:", history);
      } catch (err) {
        console.error("[차트] 강제 fetch 실패:", err);
      }
    };
    testFetch();
  }, []);

  // 1분마다 자동 갱신 (주석처리 - 업데이트 안되는 문제로)
  // useEffect(() => {
  //   console.log("자동 갱신 설정:", period, stockCode);

  //   // 기존 interval 정리
  //   if (intervalRef.current) {
  //     console.log("기존 interval 정리");
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }

  //   if (period === "1m") {
  //     console.log("분봉 자동 갱신 시작 (1분마다)");
  //     // 분봉일 때 1분마다 갱신
  //     intervalRef.current = setInterval(() => {
  //       const now = new Date().toLocaleTimeString();
  //       console.log(`[${now}] 분봉 자동 갱신 실행...`);
  //       fetchMinuteData();
  //       fetchCurrentPrice();
  //     }, 60000); // 60초 = 1분
  //   } else if (period === "1D") {
  //     console.log("일봉 현재가 갱신 시작 (1분마다)");
  //     // 일봉일 때 1분마다 현재가만 갱신
  //     intervalRef.current = setInterval(() => {
  //       const now = new Date().toLocaleTimeString();
  //       console.log(`[${now}] 현재가 자동 갱신 실행...`);
  //       fetchCurrentPrice();
  //     }, 60000); // 60초 = 1분
  //   }

  //   // cleanup
  //   return () => {
  //     if (intervalRef.current) {
  //       console.log("🧹 cleanup: interval 정리");
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //   };
  // }, [period, stockCode]);

  useEffect(() => {
    if (webViewLoaded && webRef.current && candles.length > 0) {
      console.log("WebView에 일봉 데이터 전송:", candles.length, "개");
      setTimeout(() => {
        // console.log("[차트] WebView로 전송할 데이터:", {
        //   period,
        //   candlesCount: candles.length,
        //   smaOn,
        //   alertMarkersCount: alertHistoryMarkers.length,
        //   alertMarkers: alertHistoryMarkers,
        // });
        webRef.current?.postMessage(
          JSON.stringify({
            type: "setAll",
            payload: {
              period,
              data: candles,
              smaOn,
              bollingerOn,
              alertMarkers: alertHistoryMarkers,
            },
          })
        );
      }, 200);
    }
  }, [webViewLoaded, candles, period, smaOn, bollingerOn, alertHistoryMarkers]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      //console.log("[차트] WebView 메시지 수신:", msg.type, msg.payload);

      if (
        msg.type === "crosshair" ||
        msg.type === "touch" ||
        msg.type === "click"
      ) {
        setOhlc(msg.payload.candle ?? null);
        setSmaVals(msg.payload.sma ?? {});

        // 알림이 있을 때 로그 출력
        if (msg.payload.alert) {
          console.log("[차트 헤더] 알림 표시:", msg.payload.alert);

          // 해당 날짜의 모든 알림 찾기
          const currentDate = msg.payload.candle?.time;
          const markerForDate = alertHistoryMarkers.find(
            (marker) => marker.time === currentDate
          );

          if (markerForDate && markerForDate.allAlerts) {
            // console.log(
            //   "[차트 헤더] 해당 날짜 알림들:",
            //   markerForDate.allAlerts
            // );
            setHeaderAlerts(markerForDate.allAlerts);
          } else {
            setHeaderAlerts([]);
          }
          setHeaderAlert(msg.payload.alert);
        } else {
          console.log("[차트 헤더] 알림 없음");
          setHeaderAlert(null);
          setHeaderAlerts([]);
        }
      } else if (msg.type === "webviewReady") {
        setWebViewLoaded(true);
      }
    } catch (err) {
      console.error("[차트] WebView 메시지 파싱 오류:", err);
    }
  };

  const toggle = (k: keyof typeof smaOn) =>
    setSmaOn((prev) => ({ ...prev, [k]: !prev[k] }));
  const toggleBollinger = () => setBollingerOn((prev) => !prev);
  const changePeriod = (p: Period) => setPeriod(p);

  const header = ohlc ?? lastCandle;

  // 현재가 정보 반영 (currentPrice가 있으면 우선 사용)
  const displayPrice = currentPrice?.currentPrice ?? currPrice;
  const displayDiff = currentPrice?.diff ?? diff;
  const displayDiffPct = currentPrice?.diffRate ?? diffPct;
  const displayIsUp = (currentPrice?.diff ?? diff) >= 0;

  // console.log("차트 헤더 현재가 표시:", {
  //   currentPriceFromAPI: currentPrice?.currentPrice,
  //   currPriceFromData: currPrice,
  //   displayPrice: displayPrice,
  //   displayDiff: displayDiff,
  //   displayDiffPct: displayDiffPct,
  //   forceUpdate: forceUpdate,
  //   timestamp: new Date().toLocaleTimeString(),
  // });

  return (
    <View style={styles.container}>
      {/* 고정 헤더 */}
      <View style={styles.fixedHeader}>
        <ChartHeader
          key={`header-${forceUpdate}-${displayPrice}`} // forceUpdate와 displayPrice로 강제 리렌더링
          companyName={companyName}
          ohlc={ohlc ?? lastCandle}
          smaVals={smaVals}
          headerAlert={headerAlert}
          headerAlerts={headerAlerts}
          fmt={fmt}
          ymd={ymd}
          weekday={weekday}
          diff={displayDiff}
          diffPct={displayDiffPct}
          isUp={displayIsUp}
          currPrice={displayPrice}
        />

        {/* SMA 토글 버튼 (일봉일 때만 표시) */}
        {period === "1D" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toggleBar}
          >
            {(
              [
                { key: "sma5", meta: SMA_META.sma5 },
                { key: "sma10", meta: SMA_META.sma10 },
                { key: "sma20", meta: SMA_META.sma20 },
                { key: "sma30", meta: SMA_META.sma30 },
                { key: "sma50", meta: SMA_META.sma50 },
                { key: "sma60", meta: SMA_META.sma60 },
                { key: "sma100", meta: SMA_META.sma100 },
                { key: "sma200", meta: SMA_META.sma200 },
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
                    style={{
                      color: on ? meta.chipOn : "#666",
                      fontWeight: "700",
                      fontSize: key === "sma200" ? 11 : 11,
                    }}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}

            {/* 볼린저 밴드 토글 버튼 */}
            <Pressable
              onPress={toggleBollinger}
              style={[
                styles.chip,
                { borderColor: bollingerOn ? BOLLINGER_META.line : "#D9D9D9" },
                bollingerOn
                  ? { backgroundColor: BOLLINGER_META.chipBg }
                  : styles.chipOff,
              ]}
            >
              <Text
                style={{
                  color: bollingerOn ? BOLLINGER_META.chipOn : "#666",
                  fontWeight: "700",
                  fontSize: 11,
                }}
              >
                {BOLLINGER_META.label}
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* 스크롤 가능한 차트 영역 */}
      <View style={styles.scrollableContent}>
        <View style={styles.chartContainer}>
          <WebView
            key={`webview-${forceUpdate}`} // forceUpdate로 강제 리렌더링
            ref={webRef}
            originWhitelist={["*"]}
            source={{ html: chartHtml }}
            javaScriptEnabled
            domStorageEnabled
            onMessage={onMessage}
            onLoadEnd={() => {
              setTimeout(() => {
                setWebViewLoaded(true);
              }, 200);
            }}
            style={{ flex: 1, backgroundColor: "#ffffff" }}
          />
        </View>

        {/* 기간 버튼 */}
        <View style={styles.periodBar}>
          {(["1m", "1D"] as Period[]).map((p) => (
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
                {p === "1m" ? "1분" : "일"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },

  fixedHeader: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
  },

  scrollableContent: {
    flex: 1,
  },

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
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: "#fff",
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 50,
    maxWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: "#E8F9E5" },
  chipOff: { backgroundColor: "#FFFFFF" },

  periodBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  periodBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  periodBtnActive: { backgroundColor: "#E8F9E5" },
  periodText: { color: "#666", fontWeight: "700" },
  periodTextActive: { color: "#2C8A2C" },

  chartContainer: {
    flex: 1,
    maxHeight: 400,
    minHeight: 300,
  },
});
