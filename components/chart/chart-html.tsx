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

      
      let chart,volChart,rsiChart,candle,s5,s10,s20,s30,s50,s60,s100,s200,upper,lower,vol,rsi;
      let markers=[],s5Arr=[],s10Arr=[],s20Arr=[],s30Arr=[],s50Arr=[],s60Arr=[],s100Arr=[],s200Arr=[];
      let alertMarkers=[];
      let crosshairHooked = false;

      const COLORS = {
        sma5:   '#FF8A80', 
        sma10:  '#81C784', 
        sma20:  '#90CAF9', 
        sma30:  '#FFB74D', 
        sma50:  '#BA68C8', 
        sma60:  '#B39DDB', 
        sma100: '#FFCC80', 
        sma200: '#A5D6A7', 
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
        if (s5 && s10 && s20 && s30 && s50 && s60 && s100 && s200) {
          show(s5,   s5Arr,   smaOn.sma5,   COLORS.sma5);
          show(s10,  s10Arr,  smaOn.sma10,  COLORS.sma10);
          show(s20,  s20Arr,  smaOn.sma20,  COLORS.sma20);
          show(s30,  s30Arr,  smaOn.sma30,  COLORS.sma30);
          show(s50,  s50Arr,  smaOn.sma50,  COLORS.sma50);
          show(s60,  s60Arr,  smaOn.sma60,  COLORS.sma60);
          show(s100, s100Arr, smaOn.sma100, COLORS.sma100);
          show(s200, s200Arr, smaOn.sma200, COLORS.sma200);
        }
      };

      const applyAll=({period,data,smaOn,bollingerOn,alertMarkers:receivedMarkers})=>{
        if(!window.LightweightCharts)return;
        
        // 알림 마커 저장
        alertMarkers = receivedMarkers || [];
        
        // 시간 형식 설정 (분봉용)
        const timeScaleOptions = period === '1m' ? {
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 3,
          minBarSpacing: 0.5,
        } : {
          timeVisible: false,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 6,
          minBarSpacing: 0.5,
        };

        if(!chart){
          chart=LightweightCharts.createChart(document.getElementById('main'),{
            layout:{background:{color:'#ffffff'},textColor:'#333'},
            grid:{vertLines:{color:'#f3f3f3'},horzLines:{color:'#f3f3f3'}},
            crosshair:{mode:LightweightCharts.CrosshairMode.Normal},
            timeScale: timeScaleOptions,
            priceScale: {
              borderColor: '#cccccc',
              scaleMargins: {
                top: 0.1,
                bottom: 0.1,
              },
              mode: 1, // PriceScaleMode.Normal
              autoScale: true,
              alignLabels: true,
              borderVisible: false,
              entireTextOnly: false,
              visible: true,
              ticksVisible: true,
              scaleMargins: {
                top: 0.1,
                bottom: 0.1,
              },
            },
          });
          candle=chart.addCandlestickSeries({
            upColor:COLORS.up, downColor:COLORS.down,
            borderUpColor:COLORS.up, borderDownColor:COLORS.down,
            wickUpColor:COLORS.up, wickDownColor:COLORS.down,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            }
          });

          s5   = chart.addLineSeries({ 
            color: COLORS.sma5, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s20  = chart.addLineSeries({ 
            color: COLORS.sma20, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s60  = chart.addLineSeries({ 
            color: COLORS.sma60, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s120 = chart.addLineSeries({ 
            color: COLORS.sma120, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });

          s10 = chart.addLineSeries({ 
            color: COLORS.sma10, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s30 = chart.addLineSeries({ 
            color: COLORS.sma30, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s50 = chart.addLineSeries({ 
            color: COLORS.sma50, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s100 = chart.addLineSeries({ 
            color: COLORS.sma100, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          s200 = chart.addLineSeries({ 
            color: COLORS.sma200, 
            lineWidth: 3,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });

          upper=chart.addLineSeries({
            color:COLORS.boll,
            lineWidth:1,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });
          lower=chart.addLineSeries({
            color:COLORS.boll,
            lineWidth:1,
            priceFormat: {
              type: 'price',
              precision: 0,
              minMove: 1
            },
            priceFormatter: (price) => {
              return Math.round(price).toLocaleString('ko-KR');
            }
          });

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

          // 가격 포맷 설정 (천 단위 구분자)
          chart.applyOptions({
            priceScale: {
              mode: 1,
              autoScale: true,
              alignLabels: true,
              borderVisible: false,
              entireTextOnly: false,
              visible: true,
              ticksVisible: true,
              scaleMargins: {
                top: 0.1,
                bottom: 0.1,
              },
            },
          });

          syncCharts(chart, [volChart, rsiChart]);
          new ResizeObserver(resizeAll).observe(document.getElementById('wrap'));
        } else {
          // 차트가 이미 있을 때 timeScale 옵션 업데이트
          chart.applyOptions({
            timeScale: timeScaleOptions,
          });
        }

        candle.setData(data);
        
        // 차트 초기 뷰 설정 (적절한 범위로 자동 조정)
        setTimeout(() => {
          if (data.length > 0) {
            // 최근 30개 데이터 포인트를 보여주도록 설정
            const visibleRange = Math.min(30, data.length);
            const startTime = data[data.length - visibleRange].time;
            const endTime = data[data.length - 1].time;
            
            chart.timeScale().setVisibleRange({
              from: startTime,
              to: endTime,
            });
            
            // 가격 스케일 자동 조정
            chart.timeScale().fitContent();
          }
        }, 100);
        
        // 일봉일 때만 SMA, Bollinger Band 계산
        if (period === '1D') {
          s5Arr=calcSMA(data,5); s10Arr=calcSMA(data,10); s20Arr=calcSMA(data,20); s30Arr=calcSMA(data,30);
          s50Arr=calcSMA(data,50); s60Arr=calcSMA(data,60); s100Arr=calcSMA(data,100); s200Arr=calcSMA(data,200);
          s5.setData(s5Arr); s10.setData(s10Arr); s20.setData(s20Arr); s30.setData(s30Arr);
          s50.setData(s50Arr); s60.setData(s60Arr); s100.setData(s100Arr); s200.setData(s200Arr);
          
          // 볼린저 밴드 계산 및 표시/숨김
          const {up,low}=calcBoll(data);
          if (bollingerOn) {
            upper.setData(up); lower.setData(low);
          } else {
            upper.setData([]); lower.setData([]);
          }
        } else {
          // 분봉일 때는 SMA 라인 숨기기
          s5.setData([]); s10.setData([]); s20.setData([]); s30.setData([]);
          s50.setData([]); s60.setData([]); s100.setData([]); s200.setData([]);
          upper.setData([]); lower.setData([]);
          s5Arr=[]; s10Arr=[]; s20Arr=[]; s30Arr=[]; s50Arr=[]; s60Arr=[]; s100Arr=[]; s200Arr=[];
        }
        
        vol.setData(data.map(d=>({time:d.time,value:d.volume,color:d.close>=d.open?COLORS.up:COLORS.down})));
        
        // RSI는 데이터가 충분할 때만 계산 (분봉에도 표시)
        if (data.length > 14) {
          rsi.setData(calcRSI(data));
        } else {
          rsi.setData([]);
        }

        // 알림 히스토리 마커 (일봉일 때만)
        markers=[];
        console.log('[Chart HTML] alertMarkers received:', alertMarkers);
        if (period === '1D' && alertMarkers && alertMarkers.length > 0) {
          // 이미 그룹화된 알림들을 마커로 변환
          alertMarkers.forEach(function(alert) {
            console.log('[Chart HTML] Processing alert:', alert);
            markers.push({
              time: alert.time,
              position: 'aboveBar',
              color: '#FFB300', // 노란색
              shape: 'circle',
              text: '',
              alertText: alert.alertText,
              id: alert.id,
              alertId: alert.alertId,
              alertCount: alert.alertCount || 1
            });
          });
          
          console.log('[Chart HTML] Alert markers created: ' + markers.length);
          console.log('[Chart HTML] Final markers:', markers);
        } else {
          console.log('[Chart HTML] No alert markers - period:', period, 'alertMarkers:', alertMarkers);
        }
        candle.setMarkers(markers);

        // Crosshair 알림
        if(!crosshairHooked){
          chart.subscribeCrosshairMove(param=>{
            if(!param.time)return;
            const c=param.seriesData.get(candle); if(!c)return;
            const t=param.time;
            console.log('[Crosshair] Time:', t, 'Markers:', markers.length);
            
            const alertAt = (t) => {
              console.log('[Crosshair] Looking for alert at time:', t);
              console.log('[Crosshair] Available markers times:', markers.map(m => m.time));
              
              // 시간 형식 매칭 (일봉은 문자열, 분봉은 숫자일 수 있음)
              const m = markers.find(x => x.time === t);
              
              if (!m) {
                console.log('[Crosshair] No marker found for time:', t);
                return null;
              }
              
              if (m.alertText) {
                const result = m.alertCount > 1 ? 
                  m.alertText + ' (총 ' + m.alertCount + '개 알림)' : 
                  m.alertText;
                console.log('[Crosshair] Alert found:', result);
                return result;
              }
              return null;
            };
            const candleData = data.find(d => d.time === t);
            
            // SMA 값은 일봉일 때만 전송
            const smaData = period === '1D' ? {
              sma5:smaAt(s5Arr,t),
              sma10:smaAt(s10Arr,t),
              sma20:smaAt(s20Arr,t),
              sma30:smaAt(s30Arr,t),
              sma50:smaAt(s50Arr,t),
              sma60:smaAt(s60Arr,t),
              sma100:smaAt(s100Arr,t),
              sma200:smaAt(s200Arr,t)
            } : {};
            
            const alertText = alertAt(t);
            console.log('[Crosshair] Sending alert:', alertText);
            
            send({type:'crosshair',payload:{
              candle:{
                ...c,
                volume: candleData?.volume,
                rsi14: candleData?.rsi14,
                diffFromPrev: candleData?.diffFromPrev
              },
              sma: smaData,
              alert: alertText
            }});
          });
          
          // 터치 이벤트 추가
          chart.subscribeClick((param)=>{
            if(!param.time)return;
            const c=param.seriesData.get(candle); if(!c)return;
            const t=param.time;
            console.log('[Touch/Click] Time:', t, 'Markers:', markers.length);
            
            const alertAt = (t) => {
              console.log('[Touch/Click] Looking for alert at time:', t);
              console.log('[Touch/Click] Available markers times:', markers.map(m => m.time));
              
              const m = markers.find(x => x.time === t);
              
              if (!m) {
                console.log('[Touch/Click] No marker found for time:', t);
                return null;
              }
              
              if (m.alertText) {
                const result = m.alertCount > 1 ? 
                  m.alertText + ' (총 ' + m.alertCount + '개 알림)' : 
                  m.alertText;
                console.log('[Touch/Click] Alert found:', result);
                return result;
              }
              return null;
            };
            const candleData = data.find(d => d.time === t);
            
            const smaData = period === '1D' ? {
              sma5:smaAt(s5Arr,t),
              sma10:smaAt(s10Arr,t),
              sma20:smaAt(s20Arr,t),
              sma30:smaAt(s30Arr,t),
              sma50:smaAt(s50Arr,t),
              sma60:smaAt(s60Arr,t),
              sma100:smaAt(s100Arr,t),
              sma200:smaAt(s200Arr,t)
            } : {};
            
            const alertText = alertAt(t);
            console.log('[Touch/Click] Sending alert:', alertText);
            
            send({type:'touch',payload:{
              candle:{
                ...c,
                volume: candleData?.volume,
                rsi14: candleData?.rsi14,
                diffFromPrev: candleData?.diffFromPrev
              },
              sma: smaData,
              alert: alertText
            }});
          });
          
          crosshairHooked = true;
        }

        applySmaToggle(smaOn);
        resizeAll();
      };

      load().then(()=>{
        // WebView 준비 완료 신호 전송
        send({type:'webviewReady'});
        
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
