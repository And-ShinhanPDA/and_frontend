import { getErrorMessage } from "@/utils/errorHandler";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_ALERT_URL;

export const presetService = {
  // 전체 프리셋 조회
  async getPresetList(accessToken: string) {
    const url = `${BASE_URL}/api/presets`;

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

  // 특정 프리셋 조회
  async getPresetDetail(accessToken: string, presetId: string) {
    const url = `${BASE_URL}/api/presets/${presetId}`;

    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 프리셋 추가
  async createPreset(accessToken: string, payload: any) {
    const url = `${BASE_URL}/api/presets`;

    try {
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 프리셋 수정
  async updatePreset(accessToken: string, presetId: string, payload: any) {
    const url = `${BASE_URL}/api/presets/${presetId}`;

    try {
      const res = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },

  // 프리셋 삭제
  async deletePreset(accessToken: string, presetId: string) {
    const url = `${BASE_URL}/api/presets/${presetId}`;

    try {
      const res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return res.data;
    } catch (err: any) {
      throw new Error(getErrorMessage(err));
    }
  },
};
