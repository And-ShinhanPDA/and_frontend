import { CreateAlertPayload } from "@/types/alert";
import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_ALERT_URL;

export const alertService = {
  // 알림 등록
  async createAlert(payload: CreateAlertPayload, accessToken: string) {
    const url = `${BASE_URL}/api/alerts`;
    console.log("요청 URL:", url);
    console.log("요청 데이터:", payload);
    console.log("accessToken:", accessToken?.slice(0, 20) + "...");

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  },

  // 사용자 보유 알림 조회
  async getUserAlerts(
    accessToken: string,
    params?: { stockCode?: string; enabled?: boolean }
  ) {
    const url = new URL(`${BASE_URL}/api/alerts`);

    // 쿼리 파라미터 설정
    if (params?.stockCode)
      url.searchParams.append("stockCode", params.stockCode);
    if (typeof params?.enabled === "boolean")
      url.searchParams.append("enabled", String(params.enabled));

    console.log("[GET] 사용자 보유 알림 요청 URL:", url.toString());

    try {
      const res = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[응답 데이터]:", res.data);

      if (Array.isArray(res.data?.data)) {
        console.log(`조회된 알림 개수: ${res.data.data.length}`);
        res.data.data.forEach((alert: any, i: number) => {
          console.log(
            `#${i + 1} [${alert.stockCode ?? "조건 검색"}] ${alert.title} (${
              alert.isActive ? "활성" : "비활성"
            })`
          );
        });
      }

      return res.data;
    } catch (err: any) {
      console.error("[에러]:", err.response?.data ?? err.message);
      throw err;
    }
  },

  // // 오늘 발생한 알림 조회
  // async getTodayAlerts(accessToken: string) {
  //   const url = `${BASE_URL}/alert/api/alerts/today`;
  //   console.log("[GET] 요청 URL:", url);

  //   try {
  //     const res = await axios.get(url, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     console.log("[응답 데이터]:", res.data);

  //     if (Array.isArray(res.data)) {
  //       console.log(`오늘 알림 ${res.data.length}건 수신됨`);
  //       res.data.forEach((alert, i) => {
  //         console.log(
  //           `#${i + 1} [${alert.companyName ?? alert.stockName ?? "?"}] ${
  //             alert.message ?? JSON.stringify(alert)
  //           }`
  //         );
  //       });
  //     }

  //     return res.data;
  //   } catch (err: any) {
  //     console.error("[에러]:", err.response?.data ?? err.message);
  //     throw err;
  //   }
  // },
};
