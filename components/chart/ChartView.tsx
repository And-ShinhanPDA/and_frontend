import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
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

export default function ChartScreen() {
  const companyName = "삼성전자";

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

  const data = useMemo(() => genCandles(period, 180, 79200), [period]);
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

  useEffect(() => {
    webRef.current?.postMessage(
      JSON.stringify({ type: "setAll", payload: { period, data, smaOn } })
    );
  }, [period, data, smaOn]);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body, #wrap { margin: 0; padding: 0; height: 100%; width: 100%; background: #ffffff; overflow: hidden; }
      #wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
      #main { flex: 11; }
      #vol  { flex: 2.2; }
      #rsi  { flex: 2.2; }
    </style>
  </head>
  <body>
    <div id="wrap">
      <div id="main"></div>
      <div id="vol"></div>
      <div id="rsi"></div>
    </div>
    <script>
      (function(){
        const send = (o)=>window.ReactNativeWebView.postMessage(JSON.stringify(o));
        const load=()=>new Promise(res=>{
          const s=document.createElement('script');
          s.src='https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js';
          s.onload=res;document.body.appendChild(s);
        });

        const calcSMA=(rows,p)=>rows.map((_,i)=>{
          if(i<p)return rows[i].close;
          let s=0;for(let k=i-p;k<i;k++)s+=rows[k].close;
          return s/p;
        }).map((v,i)=>({ time: rows[i].time, value: v }));

        const calcRSI=(rows,period=14)=>{
          const out=[],len=rows.length;
          if(len<=period+1) return out;
          let gains=0,losses=0;
          for(let i=1;i<=period;i++){
            const d=rows[i].close-rows[i-1].close;
            if(d>=0)gains+=d;else losses-=d;
          }
          let avgG=gains/period, avgL=losses/period;
          for(let i=period+1;i<len;i++){
            const d=rows[i].close-rows[i-1].close;
            const g=d>0?d:0, l=d<0?-d:0;
            avgG=(avgG*(period-1)+g)/period;
            avgL=(avgL*(period-1)+l)/period;
            const rs=avgL===0?100:avgG/avgL;
            out.push({ time: rows[i].time, value: 100 - (100/(1+rs)) });
          }
          return out;
        };

        const calcBoll=(rows,p=20,m=2)=>{
          const up=[],low=[];
          for(let i=0;i<rows.length;i++){
            if(i<p){ up.push({time:rows[i].time,value:rows[i].high});
                     low.push({time:rows[i].time,value:rows[i].low}); continue; }
            const sl=rows.slice(i-p,i);
            const mean=sl.reduce((a,b)=>a+b.close,0)/p;
            const sd=Math.sqrt(sl.reduce((a,b)=>a+(b.close-mean)**2,0)/p);
            up.push({time:rows[i].time,value:mean+m*sd});
            low.push({time:rows[i].time,value:mean-m*sd});
          }
          return {up,low};
        };

        let chart,volChart,rsiChart,candle,s5,s20,s60,s120,upper,lower,vol,rsi;
        let markers=[],s5Arr=[],s20Arr=[],s60Arr=[],s120Arr=[];
        const smaAt=(arr,t)=>arr.find(x=>x.time===t)?.value;

        /* === 차트 완전 동기화 === */
        const syncCharts = (masterChart, slaves) => {
          const apply = (range, method) => {
            if (!range) return;
            slaves.forEach((c) => c.timeScale()[method](range));
          };
          masterChart.timeScale().subscribeVisibleLogicalRangeChange((range) =>
            apply(range, "setVisibleLogicalRange")
          );
          masterChart.timeScale().subscribeVisibleTimeRangeChange((range) =>
            apply(range, "setVisibleRange")
          );
          slaves.forEach((chart) => {
            chart.timeScale().subscribeVisibleLogicalRangeChange((range) =>
              apply(range, "setVisibleLogicalRange")
            );
            chart.timeScale().subscribeVisibleTimeRangeChange((range) =>
              apply(range, "setVisibleRange")
            );
          });
        };

        const resizeAll = () => {
          if(!chart||!volChart||!rsiChart) return;
          const main = document.getElementById('main');
          const volD = document.getElementById('vol');
          const rsiD = document.getElementById('rsi');
          chart.resize(main.clientWidth, main.clientHeight);
          volChart.resize(volD.clientWidth, volD.clientHeight);
          rsiChart.resize(rsiD.clientWidth, rsiD.clientHeight);
        };

        const applyAll=({period,data,smaOn})=>{
          if(!window.LightweightCharts)return;
          if(!chart){
            chart=LightweightCharts.createChart(document.getElementById('main'),{
              layout:{background:{color:'#ffffff'},textColor:'#333'},
              grid:{vertLines:{color:'#f3f3f3'},horzLines:{color:'#f3f3f3'}},
              crosshair:{mode:LightweightCharts.CrosshairMode.Normal},
            });
            candle=chart.addCandlestickSeries({
              upColor:'#4CC439', downColor:'#EF5350',
              borderUpColor:'#4CC439', borderDownColor:'#EF5350',
              wickUpColor:'#4CC439', wickDownColor:'#EF5350'
            });
            s5=chart.addLineSeries({color:'#9EE493',lineWidth:2});
            s20=chart.addLineSeries({color:'#6ACE5A',lineWidth:2});
            s60=chart.addLineSeries({color:'#4CC439',lineWidth:2});
            s120=chart.addLineSeries({color:'#A9A9A9',lineWidth:2});
            upper=chart.addLineSeries({color:'rgba(0,0,0,0.25)',lineWidth:1});
            lower=chart.addLineSeries({color:'rgba(0,0,0,0.25)',lineWidth:1});

            volChart=LightweightCharts.createChart(document.getElementById('vol'),{
              layout:{background:{color:'#ffffff'},textColor:'#333'},
              grid:{vertLines:{color:'#f7f7f7'},horzLines:{color:'#f7f7f7'}},
              timeScale:{visible:false},
            });
            vol=volChart.addHistogramSeries({priceFormat:{type:'volume'}});

            rsiChart=LightweightCharts.createChart(document.getElementById('rsi'),{
              layout:{background:{color:'#ffffff'},textColor:'#333'},
              grid:{vertLines:{color:'#f7f7f7'},horzLines:{color:'#f7f7f7'}},
              timeScale:{visible:false},
            });
            rsi=rsiChart.addLineSeries({color:'#e75480',lineWidth:2});
            const t0=data[0].time,tN=data[data.length-1].time;
            const addHline=(v,c)=>rsiChart.addLineSeries({color:c,lineWidth:1,priceLineVisible:false}).setData([{time:t0,value:v},{time:tN,value:v}]);
            addHline(30,'#00B0F0'); addHline(70,'#E8395F');

            syncCharts(chart, [volChart, rsiChart]);
            new ResizeObserver(resizeAll).observe(document.getElementById('wrap'));
          }

          candle.setData(data);
          s5Arr=calcSMA(data,5); s20Arr=calcSMA(data,20); s60Arr=calcSMA(data,60); s120Arr=calcSMA(data,120);
          s5.setData(s5Arr); s20.setData(s20Arr); s60.setData(s60Arr); s120.setData(s120Arr);
          const {up,low}=calcBoll(data); upper.setData(up); lower.setData(low);
          vol.setData(data.map(d=>({time:d.time,value:d.volume,color:d.close>=d.open?'#4CC439':'#EF5350'})));
          rsi.setData(calcRSI(data));

          markers=[];
          for(let i=1;i<data.length;i++){
            const a1=s5Arr[i-1].value,b1=s20Arr[i-1].value,a2=s5Arr[i].value,b2=s20Arr[i].value;
            if(a1<b1&&a2>b2)markers.push({time:data[i].time,position:'aboveBar',color:'#FFD700',shape:'circle'});
            if(a1>b1&&a2<b2)markers.push({time:data[i].time,position:'belowBar',color:'#007BFF',shape:'circle'});
          }
          candle.setMarkers(markers);

          /* === Crosshair 이동 시 알림 표시 === */
          const alertAt = (t) => {
            const m = markers.find(x => x.time === t);
            if (!m) return null;
            if (m.color === '#FFD700') return 'SMA5가 SMA20 상향 돌파 (골든크로스)';
            if (m.color === '#007BFF') return 'SMA5가 SMA20 하향 돌파 (데드크로스)';
            return null;
          };

          chart.subscribeCrosshairMove(param=>{
            if(!param.time)return;
            const c=param.seriesData.get(candle); if(!c)return;
            const t=param.time;
            send({type:'crosshair',payload:{
              candle:c,
              sma:{sma5:smaAt(s5Arr,t),sma20:smaAt(s20Arr,t),sma60:smaAt(s60Arr,t),sma120:smaAt(s120Arr,t)},
              alert:alertAt(t)
            }});
          });

          resizeAll();
        };

        load().then(()=>{
          const onMsg=(e)=>{try{const m=JSON.parse(e.data);if(m.type==='setAll')applyAll(m.payload);}catch{}};
          document.addEventListener('message',onMsg);
          window.addEventListener('message',onMsg);
        });
      })();
    </script>
  </body>
  </html>
  `;

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
      {/* ===== 상단 기업 정보 ===== */}
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
          {ymd(header?.time)} ({weekday(header?.time)})
        </Text>
        <View style={styles.row}>
          <Text style={styles.kv}>
            시작 <Text style={styles.bold}>{fmt(header?.open)}</Text>
          </Text>
          <Text style={styles.kv}>
            최고 <Text style={styles.bold}>{fmt(header?.high)}</Text>
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.kv}>
            마지막 <Text style={styles.bold}>{fmt(header?.close)}</Text>
          </Text>
          <Text style={styles.kv}>
            최저 <Text style={styles.bold}>{fmt(header?.low)}</Text>
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

      {/* SMA 토글 버튼: 화이트 톤 + 그린 포커스 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toggleBar}
      >
        {[
          { key: "sma5", label: "5", color: "#4CC439" },
          { key: "sma20", label: "20", color: "#4CC439" },
          { key: "sma60", label: "60", color: "#4CC439" },
          { key: "sma120", label: "120", color: "#A9A9A9" },
        ].map(({ key, label, color }) => {
          const on = smaOn[key as keyof typeof smaOn];
          return (
            <Pressable
              key={key}
              onPress={() => toggle(key as keyof typeof smaOn)}
              style={[
                styles.chip,
                on ? styles.chipOn : styles.chipOff,
                { borderColor: on ? "#4CC439" : "#D9D9D9" },
              ]}
            >
              <Text
                style={{ color: on ? "#2C8A2C" : "#666", fontWeight: "700" }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* WebView: 감싸는 컨테이너로 높이 안정화 */}
      <View style={{ flex: 1, minHeight: 300 }}>
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html }}
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

/* ================== 스타일 ================== */
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
