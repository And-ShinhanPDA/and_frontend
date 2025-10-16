import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_CHART_URL;

export const chartService = {
  // 일봉 차트 데이터 가져오기
  async getDailyCandles(stockCode: string) {
    const url = `${BASE_URL}/api/daily-candles/${stockCode}`;
    console.log("[GET] 일봉 차트 데이터 요청:", url);

    try {
      const res = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      const rawData = res.data?.data || [];

      // 차트용 포맷으로 변환
      const parsedData = rawData.map((d: any) => ({
        time: d.date.split("T")[0],
        open: d.openPrice,
        high: d.highPrice,
        low: d.lowPrice,
        close: d.closePrice,
        volume: d.volume,
        sma5: d.sma5,
        sma10: d.sma10,
        sma20: d.sma20,
        sma30: d.sma30,
        sma50: d.sma50,
        sma60: d.sma60,
        sma100: d.sma100,
        sma200: d.sma200,
        bbUpper: d.bbUpper,
        bbLower: d.bbLower,
        rsi14: d.rsi14,
        diffFromPrev: d.diffFromPrev,
      }));

      console.log(`[일봉 데이터 파싱 완료] ${parsedData.length}개`);
      return parsedData;
    } catch (err: any) {
      console.error(
        "[일봉 데이터 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 분봉 차트 데이터 가져오기
  async getMinuteCandles(stockCode: string) {
    const url = `${BASE_URL}/api/minute-candles/${stockCode}`;
    console.log("[GET] 분봉 차트 데이터 요청:", url);

    try {
      const res = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      const rawData = res.data?.data || [];

      // 차트용 포맷으로 변환
      const parsedData = rawData.map((d: any) => {
        // "2024-12-11T09:30:00" 형식을 timestamp로 변환
        const dateTime = new Date(d.dateTime);
        const timestamp = Math.floor(dateTime.getTime() / 1000);

        return {
          time: timestamp,
          open: d.openPrice,
          high: d.highPrice,
          low: d.lowPrice,
          close: d.closePrice,
          volume: d.volume,
          rsi14: d.rsi14,
          diffFromPrev: d.diffFromPrev,
        };
      });

      console.log(`[분봉 데이터 파싱 완료] ${parsedData.length}개`);
      return parsedData;
    } catch (err: any) {
      console.error(
        "[분봉 데이터 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 주식별 현재가 조회
  async getCurrentPrice(stockCode: string) {
    const url = `${BASE_URL}/api/stocks/${stockCode}`;
    console.log("[GET] 현재가 조회 요청:", url);

    try {
      const res = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data?.data;
      if (!data) throw new Error("응답에 data 필드가 없습니다.");

      const parsed = {
        stockCode: data.stockCode,
        currentPrice: data.currentPrice,
        prevClosePrice: data.prevClosePrice,
        diff: data.diff,
        diffRate: data.diffRate,
      };

      console.log(`[현재가 조회 성공] ${data.stockCode}: ${data.currentPrice}`);
      return parsed;
    } catch (err: any) {
      console.error("[현재가 조회 실패]:", err.response?.data ?? err.message);
      throw err;
    }
  },
};
