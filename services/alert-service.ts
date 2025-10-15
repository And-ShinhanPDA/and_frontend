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

  // 사용자가 알림 등록한 기업 리스트 조회
  async getAlertedCompanies(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/companies?alerted=true`;
    console.log("[GET] 알림 설정된 기업 리스트:", url);

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[응답 데이터]:", res.data);

      if (Array.isArray(res.data?.data)) {
        console.log(`조회된 기업 수: ${res.data.data.length}`);
        res.data.data.forEach((company: any, i: number) => {
          console.log(
            `#${i + 1} ${company.name} (${company.stockCode}) - 알림 ${
              company.alertCount
            }개`
          );
        });
      }

      return res.data;
    } catch (err: any) {
      console.error(
        "[알림 기업 리스트 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 특정 알림 활성 / 비활성화
  async toggleAlertActive(
    accessToken: string,
    alertId: string,
    isActive: boolean
  ) {
    const url = `${BASE_URL}/api/alerts/${alertId}/toggle`;

    try {
      const res = await axios.patch(
        url,
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[특정 알림 활성/비활성 응답]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[특정 알림 활성/비활성 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 기업 알림 전체 활성 / 비활성 함수
  async toggleCompanyAlerts(
    accessToken: string,
    stockCode: string,
    isActive: boolean
  ) {
    const url = `${BASE_URL}/api/alerts/companies/${stockCode}/toggle`;

    try {
      const res = await axios.patch(
        url,
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[응답 데이터]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[기업 알림 전체 토글 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 기업 알림 전체 삭제
  async deleteCompanyAlerts(accessToken: string, stockCode: string) {
    const url = `${BASE_URL}/api/alerts/companies/${stockCode}`;
    try {
      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("[응답 데이터]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[기업 알림 전체 삭제 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 특정 알림 상세 조회
  async getAlertDetail(accessToken: string, alertId: string) {
    const url = `${BASE_URL}/api/alerts/${alertId}`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[특정 알림 상세 응답]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[특정 알림 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 특정 알림 수정 (이름, 조건 등)
  async updateAlert(
    accessToken: string,
    alertId: string,
    payload: {
      stockCode: string | null;
      title: string;
      isActive: boolean;
      conditions: {
        indicator: string;
        threshold: number | null;
        threshold2?: number | null;
      }[];
      isPreset: boolean;
    }
  ) {
    const url = `${BASE_URL}/api/alerts/${alertId}`;
    console.log("[PATCH] 특정 알림 수정 요청:", url);
    console.log("[요청 데이터]:", payload);

    try {
      const res = await axios.patch(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[특정 알림 수정 응답]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[특정 알림 수정 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 특정 알림 삭제
  async deleteAlert(accessToken: string, alertId: string) {
    const url = `${BASE_URL}/api/alerts/${alertId}`;
    console.log("[DELETE] 특정 알림 삭제 요청:", url);

    try {
      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("[특정 알림 삭제 응답]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[특정 알림 삭제 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 오늘 발생한 알림 조회
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
