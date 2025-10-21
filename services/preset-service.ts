import { getErrorMessage } from "@/utils/errorHandler";
import { apiClient } from "./api-client";

const BASE_URL = process.env.EXPO_PUBLIC_ALERT_URL;

export const presetService = {
  // 전체 프리셋 조회
  async getPresetList(accessToken: string) {
    const url = `${BASE_URL}/api/presets`;

    try {
      const res = await apiClient.get(url, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 특정 프리셋 조회
  async getPresetDetail(accessToken: string, presetId: string) {
    const url = `${BASE_URL}/api/presets/${presetId}`;

    try {
      const res = await apiClient.get(url, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 프리셋 추가
  async createPreset(accessToken: string, payload: any) {
    const url = `${BASE_URL}/api/presets`;

    try {
      const res = await apiClient.post(url, payload, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 프리셋 수정
  async updatePreset(accessToken: string, presetId: string, payload: any) {
    const url = `${BASE_URL}/api/presets/${presetId}`;

    try {
      const res = await apiClient.put(url, payload, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 프리셋 삭제
  async deletePreset(accessToken: string, presetId: string) {
    const url = `${BASE_URL}/api/presets/${presetId}`;

    try {
      const res = await apiClient.delete(url, {});

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },
};
