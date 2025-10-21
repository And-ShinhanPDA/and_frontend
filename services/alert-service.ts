import { CreateAlertPayload } from "@/types/alert";
import { getErrorMessage } from "@/utils/errorHandler";
import { apiClient } from "./api-client";

const BASE_URL = process.env.EXPO_PUBLIC_ALERT_URL;

export const alertService = {
  // 알림 등록
  async createAlert(payload: CreateAlertPayload, accessToken: string) {
    const url = `${BASE_URL}/api/alerts`;

    try {
      const res = await apiClient.post(url, payload);
      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 사용자 보유 알림 조회
  async getUserAlerts(
    accessToken: string,
    params?: { stockCode?: string | null; enabled?: boolean }
  ) {
    const url = new URL(`${BASE_URL}/api/alerts`);

    if (params?.stockCode !== undefined) {
      if (params.stockCode === null) {
        url.searchParams.append("stockCode", "null");
      } else {
        url.searchParams.append("stockCode", String(params.stockCode));
      }
    }
    if (typeof params?.enabled === "boolean")
      url.searchParams.append("enabled", String(params.enabled));

    try {
      const res = await apiClient.get(url.toString(), {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 사용자가 알림 등록한 기업 리스트 조회
  async getAlertedCompanies(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/companies?alerted=true`;

    try {
      const res = await apiClient.get(url, {});

      const { data } = res.data ?? {};

      if (!Array.isArray(data)) {
        return [];
      }

      const formatted = data.map((company: any) => ({
        id: company.stockCode,
        name: company.name,
        alertCount: company.alertCount ?? 0,
        isToggle: !!company.isToggle,
      }));

      return formatted;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
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
      const res = await apiClient.patch(url, { isActive }, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
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
      const res = await apiClient.patch(url, { isActive }, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 기업 알림 전체 삭제
  async deleteCompanyAlerts(accessToken: string, stockCode: string) {
    const url = `${BASE_URL}/api/alerts/companies/${stockCode}`;
    try {
      const res = await apiClient.delete(url, {});
      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 특정 알림 상세 조회
  async getAlertDetail(accessToken: string, alertId: string) {
    const url = `${BASE_URL}/api/alerts/${alertId}`;

    try {
      const res = await apiClient.get(url, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
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

    try {
      const res = await apiClient.patch(url, payload, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 특정 알림 삭제
  async deleteAlert(accessToken: string, alertId: string) {
    const url = `${BASE_URL}/api/alerts/${alertId}`;

    try {
      const res = await apiClient.delete(url, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },
  // 현재 활성화 된 기업 알림 (홈)
  async getTriggeredAlerts(accessToken: string, stockCodes?: string[]) {
    const url = `${BASE_URL}/api/alerts/triggered`;

    try {
      const res = await apiClient.get(url, {});

      const rawData = res.data?.data || [];

      let filtered = rawData.filter((alert: any) => alert.isActive === true);

      if (stockCodes && stockCodes.length > 0) {
        filtered = filtered.filter((a: any) =>
          stockCodes.includes(a.stockCode)
        );
      }

      const parsed = filtered.map((a: any) => ({
        alertId: a.alertId,
        stockCode: a.stockCode,
        title: a.title,
        message: a.message,
        isActive: a.isActive,
        conditions: a.conditions,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));

      return parsed;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 울린 알림들 조회(전체 / 기간)
  async getAlertHistory(
    accessToken: string,
    stockCode?: string,
    start?: string,
    end?: string
  ) {
    // stockCode가 없으면 전체 기록 조회
    const baseUrl = stockCode
      ? `${BASE_URL}/api/alerts/history/${stockCode}`
      : `${BASE_URL}/api/alerts/history`;

    const url = new URL(baseUrl);

    // 기간이 있으면 쿼리 파라미터 추가
    if (start && end) {
      url.searchParams.append("start", start);
      url.searchParams.append("end", end);
    }

    try {
      const res = await apiClient.get(url.toString(), {});

      const rawData = res.data?.data || [];

      const parsed = rawData.map((item: any) => ({
        id: item.id,
        alertId: item.alertId,
        isSent: item.isSent,
        indicatorSnapshot: item.indicatorSnapshot,
        createdAt: item.createdAt,
        stockCode: item.stockCode,
      }));

      return parsed;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 조건 검색된 기업 조회
  async getConditionSearchResults(accessToken: string, alertId: string) {
    const url = `${BASE_URL}/api/alerts/condition/${alertId}`;

    try {
      const res = await apiClient.get(url, {});

      const { code, message, data } = res.data ?? {};

      if (!Array.isArray(data)) {
        console.warn("[경고] data 필드가 배열이 아닙니다:");
        console.log("data 내용:", data);
        return [];
      }

      console.log(`조건 검색 결과: ${data.length}개 기업`);

      // 각 아이템의 상세 정보 로깅
      data.forEach((item: any, i: number) => {
        console.log(`=== 기업 ${i + 1} 상세 정보 ===`);
        console.log("전체 아이템 데이터:", JSON.stringify(item, null, 2));
        console.log(`종목 코드: ${item.stockCode}`);
        console.log(`트리거 날짜: ${item.triggerDate}`);
        console.log("values 내용:", item.values);
        console.log("=== 기업 정보 끝 ===");
      });

      // 응답 데이터를 포맷팅
      const formatted = data.map((item: any, i: number) => ({
        stockCode: item.stockCode,
        triggerDate: item.triggerDate,
        values: item.values || {},
      }));

      // console.log("=== 포맷팅된 최종 데이터 ===");
      // console.log(JSON.stringify(formatted, null, 2));

      formatted.forEach((item, i) => {
        console.log(
          `#${i + 1} [${item.stockCode}] 트리거 시간: ${item.triggerDate}`
        );
      });

      return formatted;
    } catch (err: any) {
      console.error("=== API 에러 상세 정보 ===");
      console.error("에러 객체:", err);
      console.error("에러 메시지:", err.message);
      console.error("에러 응답:", err.response);
      console.error("에러 응답 데이터:", err.response?.data);
      console.error("에러 응답 상태:", err.response?.status);
      console.error("=== API 에러 정보 끝 ===");

      const errorMsg = err.response?.data ?? err.message;
      console.error("[조건 검색된 기업 조회 실패]:", errorMsg);
      throw err;
    }
  },

  // 현재 올리고 있는 알림 조회(조건별 알림)
  async getTriggeredConditionAlerts(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/condition/triggered`;

    try {
      const res = await apiClient.get(url, {});

      const { code, message, data } = res.data ?? {};

      if (!Array.isArray(data)) {
        console.warn("[경고] data 필드가 배열이 아닙니다:");
        console.log("data 내용:", data);
        return [];
      }

      console.log(`현재 활성화된 조건 알림: ${data.length}개`);

      // 응답 데이터를 포맷팅
      const formatted = data.map((item: any) => ({
        conditionName: item.conditionName,
        activeCompanyCount: item.activeCompanyCount,
      }));

      return formatted;
    } catch (err: any) {
      const errorMsg = err.response?.data ?? err.message;
      console.error("[조건별 활성 알림 조회 실패]:", errorMsg);
      throw err;
    }
  },

  // 오늘 발생한 알림 조회
  async getTodayAlerts(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/today`;
    console.log("[GET] 요청 URL:", url);

    try {
      const res = await apiClient.get(url, {});

      const { code, message, data } = res.data ?? {};
      if (!Array.isArray(data)) {
        console.warn("[경고] data 필드가 배열이 아닙니다:", data);
        return [];
      }

      return data;
    } catch (err: any) {
      console.error(
        "[오늘의 알림 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 알림 히트맵 조회
  async getAlertHeatmap(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/heatmap`;

    try {
      const res = await apiClient.get(url, {});

      const { code, message, data } = res.data ?? {};

      if (!data || !Array.isArray(data.alerts)) {
        console.warn("[경고] data.alerts 필드가 배열이 아닙니다:", data);
        return [];
      }

      console.log(`[알림 히트맵 조회 성공] ${data.alerts.length}개 기업`);

      data.alerts.forEach((alert: any, i: number) => {
        console.log(
          `#${i + 1} [${alert.stockCode}] 알림 ${
            alert.alertCount
          }개, 가격변동률: ${alert.priceRate}%`
        );
      });

      return data.alerts;
    } catch (err: any) {
      console.error(
        "[알림 히트맵 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 시가종가 on/off 여부 조회
  async getPriceOnOffStatus(accessToken: string, stockCode: string) {
    const url = `${BASE_URL}/api/alerts/price/${stockCode}`;

    try {
      const res = await apiClient.get(url, {});

      const { data } = res.data ?? {};
      return data?.isPrice ?? false;
    } catch (err: any) {
      console.error(
        "[시가종가 on/off 여부 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 시가/종가 on/off 상태 변경
  async updatePriceOnOffStatus(
    accessToken: string,
    stockCode: string,
    togglePrice: boolean
  ) {
    const url = `${BASE_URL}/api/alerts/price/${stockCode}`;

    try {
      const res = await apiClient.patch(url, { togglePrice }, {});

      const { message, data } = res.data ?? {};

      return data;
    } catch (err: any) {
      console.error(
        "[시가/종가 on/off 상태 변경 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },
};
