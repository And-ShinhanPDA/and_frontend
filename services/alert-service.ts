import { CreateAlertPayload } from "@/types/alert";
import { getErrorMessage } from "@/utils/errorHandler";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_ALERT_URL;

export const alertService = {
  // 알림 등록
  async createAlert(payload: CreateAlertPayload, accessToken: string) {
    const url = `${BASE_URL}/api/alerts`;

    try {
      const res = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

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
      const res = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 사용자가 알림 등록한 기업 리스트 조회
  async getAlertedCompanies(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/companies?alerted=true`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

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

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
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
      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
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
      const res = await axios.patch(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 특정 알림 삭제
  async deleteAlert(accessToken: string, alertId: string) {
    const url = `${BASE_URL}/api/alerts/${alertId}`;

    try {
      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },
  // 현재 활성화 된 기업 알림 (홈)
  async getTriggeredAlerts(accessToken: string, stockCodes?: string[]) {
    const url = `${BASE_URL}/api/alerts/triggered`;

    try {
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
      const res = await axios.get(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = res.data ?? {};

      if (!Array.isArray(data)) {
        return [];
      }

      const formatted = data.map((item: any) => ({
        stockCode: item.stockCode,
        triggerDate: item.triggerDate,
        values: item.values || {},
      }));

      return formatted;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 현재 올리고 있는 알림 조회(조건별 알림)
  async getTriggeredConditionAlerts(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/condition/triggered`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = res.data ?? {};

      if (!Array.isArray(data)) {
        return [];
      }

      const formatted = data.map((item: any) => ({
        conditionName: item.conditionName,
        activeCompanyCount: item.activeCompanyCount,
      }));

      return formatted;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 오늘 발생한 알림 조회
  async getTodayAlerts(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/today`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = res.data ?? {};

      if (!Array.isArray(data)) {
        return [];
      }

      return data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 알림 히트맵 조회
  async getAlertHeatmap(accessToken: string) {
    const url = `${BASE_URL}/api/alerts/heatmap`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = res.data ?? {};

      if (!data || !Array.isArray(data.alerts)) {
        return [];
      }

      return data.alerts;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 시가종가 on/off 여부 조회
  async getPriceOnOffStatus(accessToken: string, stockCode: string) {
    const url = `${BASE_URL}/api/alerts/price/${stockCode}`;

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const { data } = res.data ?? {};
      return data?.isPrice ?? false;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
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
      const res = await axios.patch(
        url,
        { togglePrice },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = res.data ?? {};

      return data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },
};
