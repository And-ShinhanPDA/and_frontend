export const chartHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    html, body, #wrap { margin: 0; padding: 0; height: 100%; width: 100%; background: #ffffff; overflow: hidden; touch-action: pan-x pan-y; }
    #wrap { position: absolute; inset: 0; display: flex; flex-direction: column; }
    #main { flex: 11; position: relative; }
    #vol  { flex: 2.2; position: relative; }
    #rsi  { flex: 1.8; position: relative; }
    
    .chart-label {
      position: absolute;
      top: 8px;
      left: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #main-label { top: 8px; left: 12px; }
    #vol-label { top: 8px; left: 12px; }
    #rsi-label { top: 8px; left: 12px; }
  </style>
</head>
<body>
  <div id="wrap">
    <div id="main">
      <div id="main-label" class="chart-label">가격</div>
    </div>
    <div id="vol">
      <div id="vol-label" class="chart-label">거래량</div>
    </div>
    <div id="rsi">
      <div id="rsi-label" class="chart-label">RSI</div>
    </div>
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
      let period = '1D';

        const COLORS = {
          sma5:   '#FF8A80', 
          sma10:  '#FFA726', 
          sma20:  '#90CAF9', 
          sma30:  '#66BB6A', 
          sma50:  '#AB47BC', 
          sma60:  '#B39DDB', 
          sma100: '#FFCC80', 
          sma200: '#A1887F', 
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
        if(!chart) return;
        const main = document.getElementById('main');
        chart.resize(main.clientWidth, main.clientHeight);
        
        // 거래량 차트는 항상 리사이즈, RSI 차트는 일봉일 때만
        const volD = document.getElementById('vol');
        if(volChart && volD) volChart.resize(volD.clientWidth, volD.clientHeight);
        
        if (period === '1D') {
          const rsiD = document.getElementById('rsi');
          if(rsiChart && rsiD) rsiChart.resize(rsiD.clientWidth, rsiD.clientHeight);
        }
      };

      const applySmaToggle = (smaOn) => {
        // 1분봉일 때는 SMA 적용하지 않음
        if (period !== '1D') {
          console.log('[Chart HTML] 1분봉: SMA 토글 무시');
          return;
        }

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

      const applyAll=({period: newPeriod,data,smaOn,bollingerOn,alertMarkers:receivedMarkers})=>{
        if(!window.LightweightCharts)return;
        
        // period 업데이트
        period = newPeriod;
        
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

          // 거래량 차트는 항상 생성 (일봉과 1분봉 모두)
          volChart=LightweightCharts.createChart(document.getElementById('vol'),{
            layout:{background:{color:'#ffffff'},textColor:'#333'},
            grid:{vertLines:{color:'#f7f7f7'},horzLines:{color:'#f7f7f7'}},
            timeScale:{visible:false},  

            handleScroll: false, 
            handleScale: false,
            });
          vol=volChart.addHistogramSeries({priceFormat:{type:'volume'}});

          // RSI 차트는 일봉일 때만 생성
          if (period === '1D') {
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
          }

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

          // 차트 동기화 (거래량은 항상, RSI는 일봉일 때만)
          const chartsToSync = [volChart];
          if (period === '1D' && rsiChart) {
            chartsToSync.push(rsiChart);
          }
          syncCharts(chart, chartsToSync);
          new ResizeObserver(resizeAll).observe(document.getElementById('wrap'));
        } else {
          // 차트가 이미 있을 때 timeScale 옵션 업데이트
          chart.applyOptions({
            timeScale: timeScaleOptions,
          });
        }

        // period에 따라 RSI 차트만 표시/숨김 제어 (거래량은 항상 표시)
        const volDiv = document.getElementById('vol');
        const rsiDiv = document.getElementById('rsi');
        if (volDiv) volDiv.style.display = 'block'; // 거래량 차트는 항상 표시
        if (rsiDiv) rsiDiv.style.display = period === '1D' ? 'block' : 'none';
        
        // 라벨 업데이트
        const mainLabel = document.getElementById('main-label');
        const volLabel = document.getElementById('vol-label');
        const rsiLabel = document.getElementById('rsi-label');
        
        if (mainLabel) {
          mainLabel.textContent = period === '1D' ? '일봉' : '1분봉';
        }
        if (volLabel) {
          volLabel.textContent = '거래량';
        }
        if (rsiLabel) {
          rsiLabel.textContent = 'RSI';
        }

        candle.setData(data);
        
         // 차트 초기 뷰 설정 (차트가 새로 생성되거나 업데이트될 때마다 적용)
         setTimeout(() => {
           if (data.length > 0) {
             // 일봉일 때는 10월부터 한 달치 데이터를 보여주도록 설정
             if (period === '1D') {
               // 10월 데이터 찾기
               const octoberData = data.filter(d => {
                 const date = new Date(d.time * 1000);
                 const month = date.getMonth() + 1; // 0-based이므로 +1
                 return month === 10; // 10월
               });
               
               if (octoberData.length > 0) {
                 // 10월 첫 번째 데이터부터 한 달치 (약 30일) 표시
                 const octoberStart = octoberData[0].time;
                 const octoberEnd = octoberData[octoberData.length - 1].time;
                 
                 // 10월 데이터가 있으면 10월부터 표시, 없으면 최근 30개 데이터 표시
                 chart.timeScale().setVisibleRange({
                   from: octoberStart,
                   to: octoberEnd,
                 });
               } else {
                 // 10월 데이터가 없으면 최근 30개 데이터 표시
                 const visibleRange = Math.min(30, data.length);
                 const startTime = data[data.length - visibleRange].time;
                 const endTime = data[data.length - 1].time;
                 
                 chart.timeScale().setVisibleRange({
                   from: startTime,
                   to: endTime,
                 });
               }
             } else {
               // 분봉일 때는 최근 30개 데이터 포인트 표시
               const visibleRange = Math.min(30, data.length);
               const startTime = data[data.length - visibleRange].time;
               const endTime = data[data.length - 1].time;
               
               chart.timeScale().setVisibleRange({
                 from: startTime,
                 to: endTime,
               });
             }
           }
         }, 500);
        
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
          if(s5) s5.setData([]); 
          if(s10) s10.setData([]); 
          if(s20) s20.setData([]); 
          if(s30) s30.setData([]);
          if(s50) s50.setData([]); 
          if(s60) s60.setData([]); 
          if(s100) s100.setData([]); 
          if(s200) s200.setData([]);
          if(upper) upper.setData([]); 
          if(lower) lower.setData([]);
          
          // SMA 배열들도 완전히 초기화
          s5Arr=[]; s10Arr=[]; s20Arr=[]; s30Arr=[]; 
          s50Arr=[]; s60Arr=[]; s100Arr=[]; s200Arr=[];
          
          console.log('[Chart HTML] 1분봉 전환: SMA 데이터 초기화 완료');
        }
        
        // 거래량 차트는 항상 데이터 설정 (일봉과 1분봉 모두)
        const volumeData = data.map(d=>({time:d.time,value:d.volume,color:d.close>=d.open?COLORS.up:COLORS.down}));
        console.log('[Chart HTML] 거래량 데이터 설정:', volumeData.slice(0, 3));
        if(vol) vol.setData(volumeData);
        
        // RSI는 일봉일 때만 데이터 설정
        if (period === '1D') {
          // RSI는 데이터가 충분할 때만 계산
          if (data.length > 14) {
            if(rsi) rsi.setData(calcRSI(data));
          } else {
            if(rsi) rsi.setData([]);
          }
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

      const toggleSubCharts = (show) => {
        const volDiv = document.getElementById('vol');
        const rsiDiv = document.getElementById('rsi');
        // 거래량 차트는 항상 show 파라미터에 따라 표시/숨김
        if (volDiv) volDiv.style.display = show ? 'block' : 'none';
        // RSI 차트는 일봉일 때만 show 파라미터에 따라 표시/숨김
        if (rsiDiv) rsiDiv.style.display = (show && period === '1D') ? 'block' : 'none';
      };

      load().then(()=>{
        // WebView 준비 완료 신호 전송
        send({type:'webviewReady'});
        
        const onMsg=(e)=>{try{
          const m=JSON.parse(e.data);
          if(m.type==='setAll')applyAll(m.payload);
          else if(m.type==='toggleSubCharts')toggleSubCharts(m.payload.showSubCharts);
          else if(m.type==='highlightTime'){
            // highlightTime으로 차트 이동 및 마커 표시
            const targetTime = m.time;
            console.log('[차트 HTML] highlightTime 받음:', targetTime);
            
            // 차트에서 해당 시점으로 스크롤 및 마커 표시
            if(mainSeries && targetTime){
              try{
                // 시간 문자열을 파싱 (예: "14:30")
                const [hour, minute] = targetTime.split(':').map(Number);
                const today = new Date();
                today.setHours(hour, minute, 0, 0);
                const targetTimestamp = Math.floor(today.getTime() / 1000);
                
                // 해당 시점으로 이동
                mainChart.timeScale().scrollToPosition(5, false);
                
                // 마커 추가 (빨간 점)
                const markers = [{
                  time: targetTimestamp,
                  position: 'inBar',
                  color: '#FF4444',
                  shape: 'circle',
                  text: '알림',
                  size: 2
                }];
                mainSeries.setMarkers(markers);
              }catch(err){
                console.error('[차트 HTML] highlightTime 처리 에러:', err);
              }
            }
          }
        }catch{}};
        document.addEventListener('message',onMsg);
        window.addEventListener('message',onMsg);
      });
    })();
  </script>
</body>
</html>
`;
