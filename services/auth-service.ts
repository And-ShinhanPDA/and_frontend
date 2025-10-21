import { AuthResponse, SignInPayload, SignUpPayload, User } from "@/types/auth";
import { getErrorMessage } from "@/utils/errorHandler";
import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_USER_URL;

export const authService = {
  // 회원가입
  async signUp(payload: SignUpPayload): Promise<User> {
    const url = `${BASE_URL}/api/auth/signup`;

    const requestBody = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      fcmToken: payload.fcmToken,
      deviceId: payload.deviceId,
    };

    try {
      const res = await axios.post<AuthResponse<User>>(url, requestBody, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `회원가입에 실패했습니다.`);
      }

      return res.data.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      throw new Error(errorMsg);
    }
  },
  // 로그인
  async signIn(payload: SignInPayload): Promise<{
    user: User;
    accessToken: string;
    refreshTokenId: string;
  }> {
    const url = `${BASE_URL}/api/auth/login`;

    try {
      const res = await axios.post<
        AuthResponse<{
          userId: number;
          email: string;
          name: string;
          accessToken: string;
          refreshTokenId: string;
          deviceId: string;
        }>
      >(url, payload, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `로그인에 실패했습니다.`);
      }

      const user: User = {
        id: res.data.data.userId,
        email: res.data.data.email,
        name: res.data.data.name,
      };

      return {
        user,
        accessToken: res.data.data.accessToken,
        refreshTokenId: res.data.data.refreshTokenId,
      };
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      throw new Error(errorMsg);
    }
  },

  // 토큰 만료 시 재발급
  async refresh(accessToken: string, refreshTokenId: string): Promise<string> {
    const res = await axios.post<AuthResponse<{ accessToken: string }>>(
      `${BASE_URL}/api/auth/refresh`,
      { refreshTokenId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return res.data.data.accessToken;
  },

  // 로그아웃
  async logout(
    accessToken: string,
    refreshTokenId: string,
    deviceId: string
  ): Promise<void> {
    const url = `${BASE_URL}/api/auth/logout`;

    const requestBody = {
      deviceId,
      refreshTokenId,
    };

    try {
      const res = await axios.delete<AuthResponse<string>>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        data: requestBody,
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `로그아웃에 실패했습니다.`);
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      throw new Error(errorMsg);
    }
  },
};
