export const chartHtml = `
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
    #rsi  { flex: 1.8; }
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

      const calcRSI = (rows, period = 14) => {
      const out = [];
      const len = rows.length;
      if (len < 2) return [];

      for (let i = 0; i < period; i++) {
        out.push({ time: rows[i].time, value: null });
      }

      let gains = 0, losses = 0;
      for (let i = 1; i <= period; i++) {
        const d = rows[i].close - rows[i - 1].close;
        if (d >= 0) gains += d;
        else losses -= d;
      }

      let avgG = gains / period, avgL = losses / period;
      for (let i = period + 1; i < len; i++) {
        const d = rows[i].close - rows[i - 1].close;
        const g = d > 0 ? d : 0, l = d < 0 ? -d : 0;
        avgG = (avgG * (period - 1) + g) / period;
        avgL = (avgL * (period - 1) + l) / period;
        const rs = avgL === 0 ? 100 : avgG / avgL;
        const rsi = 100 - (100 / (1 + rs));
        out.push({ time: rows[i].time, value: rsi });
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
      let crosshairHooked = false;

      const COLORS = {
        sma5:   '#FF8A80', 
        sma20:  '#90CAF9', 
        sma60:  '#B39DDB', 
        sma120: '#FFCC80', 
        boll:   'rgba(0,0,0,0.25)',
        up:     '#4CC439',
        down:   '#EF5350',
      };

      const smaAt=(arr,t)=>arr.find(x=>x.time===t)?.value;


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

      const applySmaToggle = (smaOn) => {

        const show = (series, arr, on, color) => {
          try { series.applyOptions({ visible: !!on, color, lineWidth: on ? 1.5 : 1 }); } catch(e){}
          series.setData(on ? arr : []); 
        };
        if (s5 && s20 && s60 && s120) {
          show(s5,   s5Arr,   smaOn.sma5,   COLORS.sma5);
          show(s20,  s20Arr,  smaOn.sma20,  COLORS.sma20);
          show(s60,  s60Arr,  smaOn.sma60,  COLORS.sma60);
          show(s120, s120Arr, smaOn.sma120, COLORS.sma120);
        }
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
            upColor:COLORS.up, downColor:COLORS.down,
            borderUpColor:COLORS.up, borderDownColor:COLORS.down,
            wickUpColor:COLORS.up, wickDownColor:COLORS.down
          });

          s5   = chart.addLineSeries({ color: COLORS.sma5,   lineWidth: 3 });
          s20  = chart.addLineSeries({ color: COLORS.sma20,  lineWidth: 3 });
          s60  = chart.addLineSeries({ color: COLORS.sma60,  lineWidth: 3 });
          s120 = chart.addLineSeries({ color: COLORS.sma120, lineWidth: 3 });

          upper=chart.addLineSeries({color:COLORS.boll,lineWidth:1});
          lower=chart.addLineSeries({color:COLORS.boll,lineWidth:1});

          volChart=LightweightCharts.createChart(document.getElementById('vol'),{
            layout:{background:{color:'#ffffff'},textColor:'#333'},
            grid:{vertLines:{color:'#f7f7f7'},horzLines:{color:'#f7f7f7'}},
            timeScale:{visible:false},  

            handleScroll: false, 
            handleScale: false,
            });
          vol=volChart.addHistogramSeries({priceFormat:{type:'volume'}});

          rsiChart=LightweightCharts.createChart(document.getElementById('rsi'),{
            layout:{background:{color:'#ffffff'},textColor:'#333'},
            grid:{vertLines:{color:'#f7f7f7'},horzLines:{color:'#f7f7f7'}},
            timeScale:{visible:false},


            handleScroll: false, 
            handleScale: false,
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
        vol.setData(data.map(d=>({time:d.time,value:d.volume,color:d.close>=d.open?COLORS.up:COLORS.down})));
        rsi.setData(calcRSI(data));

        // 골/데드크로스 마커
        markers=[];
        for(let i=1;i<data.length;i++){
          const a1=s5Arr[i-1].value,b1=s20Arr[i-1].value,a2=s5Arr[i].value,b2=s20Arr[i].value;
          if(a1<b1&&a2>b2)markers.push({time:data[i].time,position:'aboveBar',color:'#FFD700',shape:'circle'});
          if(a1>b1&&a2<b2)markers.push({time:data[i].time,position:'belowBar',color:'#007BFF',shape:'circle'});
        }
        candle.setMarkers(markers);

        // Crosshair 알림
        if(!crosshairHooked){
          chart.subscribeCrosshairMove(param=>{
            if(!param.time)return;
            const c=param.seriesData.get(candle); if(!c)return;
            const t=param.time;
            const alertAt = (t) => {
              const m = markers.find(x => x.time === t);
              if (!m) return null;
              if (m.color === '#FFD700') return 'SMA5가 SMA20 상향 돌파 (골든크로스)';
              if (m.color === '#007BFF') return 'SMA5가 SMA20 하향 돌파 (데드크로스)';
              return null;
            };
            send({type:'crosshair',payload:{
              candle:c,
              sma:{sma5:smaAt(s5Arr,t),sma20:smaAt(s20Arr,t),sma60:smaAt(s60Arr,t),sma120:smaAt(s120Arr,t)},
              alert:alertAt(t)
            }});
          });
          crosshairHooked = true;
        }

        applySmaToggle(smaOn);
        resizeAll();
      };

      load().then(()=>{
        const onMsg=(e)=>{try{
          const m=JSON.parse(e.data);
          if(m.type==='setAll')applyAll(m.payload);
        }catch{}};
        document.addEventListener('message',onMsg);
        window.addEventListener('message',onMsg);
      });
    })();
  </script>
</body>
</html>
`;
