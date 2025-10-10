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

const genCandles = (period: Period, count: number, base = 48000): Candle[] => {
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

  const data = useMemo(() => genCandles(period, 180, 48000), [period]);
  const webRef = useRef<WebView>(null);

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
      html, body { margin: 0; padding: 0; height: 100%; background-color: #0e0e0e; }
      #wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
      #main { flex: 8; }
      #vol { flex: 1.5; }
      #rsi { flex: 1.5; }
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
        const markerTextAt=(t)=>{
          const m=markers.find(x=>x.time===t);
          if(!m)return null;
          return m.text==='GC'?'SMA5가 SMA20을 상향돌파 (골든크로스)':'SMA5가 SMA20을 하향돌파 (데드크로스)';
        };

        const syncCharts = (masterChart, slaves) => {
  const sync = (range, method) => {
    if (!range) return;
    slaves.forEach((c) => c.timeScale()[method](range));
  };

  masterChart.timeScale().subscribeVisibleTimeRangeChange((range) =>
    sync(range, "setVisibleRange")
  );
  masterChart.timeScale().subscribeVisibleLogicalRangeChange((range) =>
    sync(range, "setVisibleLogicalRange")
  );
};



        const applyAll=({period,data,smaOn})=>{
          if(!window.LightweightCharts)return;
          if(!chart){
            chart=LightweightCharts.createChart(document.getElementById('main'),{
              layout:{background:{color:'#0e0e0e'},textColor:'#d1d4dc'},
              grid:{vertLines:{color:'#1e1e1e'},horzLines:{color:'#1e1e1e'}},
              crosshair:{mode:LightweightCharts.CrosshairMode.Normal},
            });
            candle=chart.addCandlestickSeries({
              upColor:'#26a69a',downColor:'#ef5350',
              borderUpColor:'#26a69a',borderDownColor:'#ef5350',
              wickUpColor:'#26a69a',wickDownColor:'#ef5350'
            });
            s5=chart.addLineSeries({color:'#00D5C0',lineWidth:2});
            s20=chart.addLineSeries({color:'#FF9E00',lineWidth:2});
            s60=chart.addLineSeries({color:'#6A5ACD',lineWidth:2});
            s120=chart.addLineSeries({color:'#9E9E9E',lineWidth:2});
            upper=chart.addLineSeries({color:'rgba(255,255,255,0.3)',lineWidth:1});
            lower=chart.addLineSeries({color:'rgba(255,255,255,0.3)',lineWidth:1});

            volChart=LightweightCharts.createChart(document.getElementById('vol'),{
              layout:{background:{color:'#0e0e0e'},textColor:'#d1d4dc'},
              grid:{vertLines:{color:'#1e1e1e'},horzLines:{color:'#1e1e1e'}},
              timeScale:{visible:false},
            });
            vol=volChart.addHistogramSeries({priceFormat:{type:'volume'}});

            rsiChart=LightweightCharts.createChart(document.getElementById('rsi'),{
              layout:{background:{color:'#0e0e0e'},textColor:'#d1d4dc'},
              grid:{vertLines:{color:'#1e1e1e'},horzLines:{color:'#1e1e1e'}},
              timeScale:{visible:false},
            });
            rsi=rsiChart.addLineSeries({color:'#e75480',lineWidth:2});
            const t0=data[0].time,tN=data[data.length-1].time;
            const line=(v,c)=>rsiChart.addLineSeries({color:c,lineWidth:1,priceLineVisible:false}).setData([{time:t0,value:v},{time:tN,value:v}]);
            line(30,'#00B0F0'); line(70,'#E8395F');

            // === 동기화 추가 ===
            syncCharts(chart, [volChart, rsiChart]);


            chart.subscribeCrosshairMove(param=>{
              if(!param.time)return;
              const c=param.seriesData.get(candle);
              if(!c)return;
              const t=param.time;
              send({type:'crosshair',payload:{
                candle:c,
                sma:{sma5:smaAt(s5Arr,t),sma20:smaAt(s20Arr,t),sma60:smaAt(s60Arr,t),sma120:smaAt(s120Arr,t)},
                alert:markerTextAt(t)
              }});
            });
          }

          candle.setData(data);
          s5Arr=calcSMA(data,5); s20Arr=calcSMA(data,20); s60Arr=calcSMA(data,60); s120Arr=calcSMA(data,120);
          s5.setData(s5Arr); s20.setData(s20Arr); s60.setData(s60Arr); s120.setData(s120Arr);
          const {up,low}=calcBoll(data); upper.setData(up); lower.setData(low);
          vol.setData(data.map(d=>({time:d.time,value:d.volume,color:d.close>=d.open?'#26a69a':'#ef5350'})));
          rsi.setData(calcRSI(data));

          markers=[];
          for(let i=1;i<data.length;i++){
            const a1=s5Arr[i-1].value,b1=s20Arr[i-1].value,a2=s5Arr[i].value,b2=s20Arr[i].value;
            if(a1<b1&&a2>b2)markers.push({time:data[i].time,position:'aboveBar',color:'#FFD700',shape:'arrowUp',text:'GC'});
            if(a1>b1&&a2<b2)markers.push({time:data[i].time,position:'belowBar',color:'#00BFFF',shape:'arrowDown',text:'DC'});
          }
          candle.setMarkers(markers);
          s5.applyOptions({visible:smaOn.sma5});
          s20.applyOptions({visible:smaOn.sma20});
          s60.applyOptions({visible:smaOn.sma60});
          s120.applyOptions({visible:smaOn.sma120});
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
      <View style={styles.header}>
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
          <Text style={{ color: "#00D5C0" }}>5 {fmt(smaVals.sma5)}</Text>
          <Text style={{ color: "#FF9E00" }}>20 {fmt(smaVals.sma20)}</Text>
          <Text style={{ color: "#6A5ACD" }}>60 {fmt(smaVals.sma60)}</Text>
          <Text style={{ color: "#9E9E9E" }}>120 {fmt(smaVals.sma120)}</Text>
        </View>
        {headerAlert && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>🔔 알림</Text>
            <Text style={styles.alertText}>{headerAlert}</Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toggleBar}
      >
        {[
          { key: "sma5", label: "5", color: "#00D5C0" },
          { key: "sma20", label: "20", color: "#FF9E00" },
          { key: "sma60", label: "60", color: "#6A5ACD" },
          { key: "sma120", label: "120", color: "#9E9E9E" },
        ].map(({ key, label, color }) => (
          <Pressable
            key={key}
            onPress={() => toggle(key as keyof typeof smaOn)}
            style={[
              styles.chip,
              smaOn[key as keyof typeof smaOn] ? styles.chipOn : styles.chipOff,
              { borderColor: color },
            ]}
          >
            <Text style={{ color }}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1, minHeight: 350 }}>
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          style={{ flex: 1, backgroundColor: "#0e0e0e" }}
        />
      </View>

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
  container: { flex: 1, backgroundColor: "#0e0e0e" },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#252525",
    backgroundColor: "#0e0e0e",
  },
  date: { color: "#cfcfcf", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  kv: { color: "#ddd" },
  bold: { fontWeight: "700", color: "#fff" },
  ma: { fontWeight: "600" },
  alertBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  alertTitle: { color: "#FFD700", fontWeight: "700", marginBottom: 4 },
  alertText: { color: "#eee", fontSize: 12 },
  toggleBar: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  chipOn: { backgroundColor: "#171717" },
  chipOff: { backgroundColor: "transparent", opacity: 0.6 },
  periodBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#0f0f0f",
  },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  periodBtnActive: { backgroundColor: "#1e1e1e" },
  periodText: { color: "#aaa", fontWeight: "600" },
  periodTextActive: { color: "#fff" },
});
