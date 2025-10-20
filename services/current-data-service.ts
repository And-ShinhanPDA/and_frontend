import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_CHART_URL;

export interface DailyData {
  stockCode: string;
  date: string;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  rsi14: number;
  bbUpper: number;
  bbLower: number;
  sma5: number;
  sma10: number;
  sma20: number;
  sma30: number;
  sma50: number;
  sma100: number;
  sma200: number;
  avgVol20: number;
}

export interface MinuteData {
  pct_vs_prev_vol: number;
  volume: number;
  diffFromHigh52wPct: number;
  diffFromLow52wPct: number;
  price: number;
  diffFromOpen: number;
  diffFromOpenPct: number;
  volumeRatio: number;
}

export interface CurrentData {
  daily: DailyData;
  minute: MinuteData;
  currentPrice: number;
  currentVolume: number;
  smaValues: {
    sma5: number;
    sma10: number;
    sma20: number;
    sma30: number;
    sma50: number;
    sma100: number;
    sma200: number;
  };
  rsi14: number;
  bbUpper: number;
  bbLower: number;
  volumeRatio: number;
  diffFromHigh52wPct: number;
  diffFromLow52wPct: number;
}

export const currentDataService = {
  // 현재 시점 데이터 조회 (daily + minute 조합)
  async getCurrentData(stockCode: string): Promise<CurrentData> {
    try {
      console.log(`📡 현재 데이터 조회 시작: ${stockCode}`);

      const [dailyRes, minuteRes] = await Promise.all([
        axios.get(`${BASE_URL}/redis/get?key=daily:${stockCode}`),
        axios.get(`${BASE_URL}/redis/get?key=minute:${stockCode}`),
      ]);

      const dailyData: DailyData = dailyRes.data;
      const minuteData: MinuteData = minuteRes.data;

      console.log("📡 Daily 데이터:", dailyData);
      console.log("📡 Minute 데이터:", minuteData);

      // 현재 시점 데이터 조합
      const currentData: CurrentData = {
        daily: dailyData,
        minute: minuteData,
        currentPrice: minuteData.price, // 현재가는 minute에서 가져옴
        currentVolume: minuteData.volume,
        smaValues: {
          sma5: dailyData.sma5,
          sma10: dailyData.sma10,
          sma20: dailyData.sma20,
          sma30: dailyData.sma30,
          sma50: dailyData.sma50,
          sma100: dailyData.sma100,
          sma200: dailyData.sma200,
        },
        rsi14: dailyData.rsi14,
        bbUpper: dailyData.bbUpper,
        bbLower: dailyData.bbLower,
        volumeRatio: minuteData.volumeRatio,
        diffFromHigh52wPct: minuteData.diffFromHigh52wPct,
        diffFromLow52wPct: minuteData.diffFromLow52wPct,
      };

      //   console.log("조합된 현재 데이터:", currentData);
      return currentData;
    } catch (err: any) {
      console.error("현재 데이터 조회 실패:", err);
      throw new Error(`현재 데이터 조회 실패: ${err.message}`);
    }
  },

  // 현재가만 조회
  async getCurrentPrice(stockCode: string): Promise<number> {
    try {
      const res = await axios.get(
        `${BASE_URL}/redis/get?key=minute:${stockCode}`
      );
      return res.data.price;
    } catch (err: any) {
      console.error("현재가 조회 실패:", err);
      throw new Error(`현재가 조회 실패: ${err.message}`);
    }
  },

  // SMA 값들만 조회
  async getSMAValues(stockCode: string) {
    try {
      const res = await axios.get(
        `${BASE_URL}/redis/get?key=daily:${stockCode}`
      );
      const data: DailyData = res.data;

      return {
        sma5: data.sma5,
        sma10: data.sma10,
        sma20: data.sma20,
        sma30: data.sma30,
        sma50: data.sma50,
        sma100: data.sma100,
        sma200: data.sma200,
      };
    } catch (err: any) {
      console.error("SMA 값 조회 실패:", err);
      throw new Error(`SMA 값 조회 실패: ${err.message}`);
    }
  },

  // RSI 값 조회
  async getRSIValue(stockCode: string): Promise<number> {
    try {
      const res = await axios.get(
        `${BASE_URL}/redis/get?key=daily:${stockCode}`
      );
      return res.data.rsi14;
    } catch (err: any) {
      console.error("RSI 값 조회 실패:", err);
      throw new Error(`RSI 값 조회 실패: ${err.message}`);
    }
  },

  // 볼린저밴드 값 조회
  async getBollingerBandValues(stockCode: string) {
    try {
      const res = await axios.get(
        `${BASE_URL}/redis/get?key=daily:${stockCode}`
      );
      const data: DailyData = res.data;

      return {
        upper: data.bbUpper,
        lower: data.bbLower,
        current: data.closePrice,
      };
    } catch (err: any) {
      console.error("볼린저밴드 값 조회 실패:", err);
      throw new Error(`볼린저밴드 값 조회 실패: ${err.message}`);
    }
  },

  // 52주 고가/저가 대비 비율 조회
  async get52WeekValues(stockCode: string) {
    try {
      const res = await axios.get(
        `${BASE_URL}/redis/get?key=minute:${stockCode}`
      );
      const data: MinuteData = res.data;

      return {
        diffFromHigh52wPct: data.diffFromHigh52wPct,
        diffFromLow52wPct: data.diffFromLow52wPct,
        currentPrice: data.price,
      };
    } catch (err: any) {
      console.error("52주 값 조회 실패:", err);
      throw new Error(`52주 값 조회 실패: ${err.message}`);
    }
  },

  // 거래량 관련 값 조회
  async getVolumeValues(stockCode: string) {
    try {
      const [dailyRes, minuteRes] = await Promise.all([
        axios.get(`${BASE_URL}/redis/get?key=daily:${stockCode}`),
        axios.get(`${BASE_URL}/redis/get?key=minute:${stockCode}`),
      ]);

      const dailyData: DailyData = dailyRes.data;
      const minuteData: MinuteData = minuteRes.data;

      return {
        currentVolume: minuteData.volume,
        avgVol20: dailyData.avgVol20,
        volumeRatio: minuteData.volumeRatio,
        pctVsPrevVol: minuteData.pct_vs_prev_vol,
      };
    } catch (err: any) {
      console.error("거래량 값 조회 실패:", err);
      throw new Error(`거래량 값 조회 실패: ${err.message}`);
    }
  },
};
