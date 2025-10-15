import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_ALERT_URL;

export const presetService = {
  // 전체 프리셋 조회
  async getPresetList(accessToken: string) {
    const url = `${BASE_URL}/api/presets`;
    console.log("[GET] 프리셋 조회 요청:", url);
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("[프리셋 조회 성공]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error("[프리셋 조회 실패]:", err.response?.data ?? err.message);
      throw err;
    }
  },

  // 특정 프리셋 조회
  async getPresetDetail(accessToken: string, presetId: string) {
    const url = `${BASE_URL}/api/presets/${presetId}`;
    console.log("[GET] 특정 프리셋 조회 요청:", url);
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[특정 프리셋 조회 성공]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error(
        "[특정 프리셋 조회 실패]:",
        err.response?.data ?? err.message
      );
      throw err;
    }
  },

  // 프리셋 추가
  async createPreset(accessToken: string, payload: any) {
    const url = `${BASE_URL}/api/presets`;
    console.log("[POST] 프리셋 추가 요청:", url);
    try {
      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[프리셋 추가 성공]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error("[프리셋 추가 실패]:", err.response?.data ?? err.message);
      throw err;
    }
  },

  // 프리셋 수정
  async updatePreset(accessToken: string, presetId: string, payload: any) {
    const url = `${BASE_URL}/api/presets/${presetId}`;
    console.log("[PATCH] 프리셋 수정 요청:", url);
    try {
      const res = await axios.patch(url, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("[프리셋 수정 성공]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error("[프리셋 수정 실패]:", err.response?.data ?? err.message);
      throw err;
    }
  },

  // 프리셋 삭제
  async deletePreset(accessToken: string, presetId: string) {
    const url = `${BASE_URL}/api/presets/${presetId}`;
    console.log("[DELETE] 프리셋 삭제 요청:", url);
    try {
      const res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("[프리셋 삭제 성공]:", res.data);
      return res.data;
    } catch (err: any) {
      console.error("[프리셋 삭제 실패]:", err.response?.data ?? err.message);
      throw err;
    }
  },
};
