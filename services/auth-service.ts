import { AuthResponse, SignInPayload, SignUpPayload, User } from "@/types/auth";
import axios from "axios";

// 🚨 iOS ATS 우회: HTTP 사용 (ATS 예외로 허용)
const BASE_URL = "http://43.203.153.18/alert";

export const authService = {
  // 회원가입
  async signUp(payload: SignUpPayload): Promise<User> {
    const url = `${BASE_URL}/api/auth/signup`;
    console.log("🔗 [auth-service] 회원가입 URL:", url);
    console.log(
      "📝 [auth-service] 회원가입 데이터:",
      JSON.stringify(payload, null, 2)
    );

    try {
      const res = await axios.post<AuthResponse<User>>(url, payload, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      console.log("📨 [auth-service] 회원가입 응답 Status:", res.status);
      console.log(
        "📨 [auth-service] 회원가입 응답 Data:",
        JSON.stringify(res.data, null, 2)
      );

      if (res.status < 200 || res.status >= 300) {
        console.error("❌ [auth-service] 회원가입 HTTP 에러:", {
          status: res.status,
          statusText: res.statusText,
          data: res.data,
        });
        throw new Error(
          res.data?.message || `HTTP ${res.status}: ${res.statusText}`
        );
      }

      console.log("✅ [auth-service] 회원가입 성공!");
      return res.data.data;
    } catch (err: any) {
      console.error("💥 [auth-service] 회원가입 네트워크 에러:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
      });
      throw err;
    }
  },
  // 로그인
  async signIn(payload: SignInPayload): Promise<{
    user: User;
    accessToken: string;
    refreshTokenId: string;
  }> {
    const url = `${BASE_URL}/api/auth/login`;
    console.log("🔗 [auth-service] 요청 URL:", url);
    console.log("📧 [auth-service] Email:", payload.email);

    try {
      const res = await axios.post<
        AuthResponse<{
          userId: number;
          email: string;
          name: string;
          accessToken: string;
          refreshTokenId: string;
        }>
      >(url, payload, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500, // 400-499도 받기
      });

      console.log("📨 [auth-service] 응답 Status:", res.status);
      console.log(
        "📨 [auth-service] 응답 Data:",
        JSON.stringify(res.data, null, 2)
      );

      // 2xx가 아니면 에러로 처리
      if (res.status < 200 || res.status >= 300) {
        console.error("❌ [auth-service] HTTP 에러:", {
          status: res.status,
          statusText: res.statusText,
          data: res.data,
        });
        throw new Error(
          res.data?.message || `HTTP ${res.status}: ${res.statusText}`
        );
      }

      const user: User = {
        id: res.data.data.userId,
        email: res.data.data.email,
        name: res.data.data.name,
      };

      console.log("✅ [auth-service] 로그인 성공!");
      return {
        user,
        accessToken: res.data.data.accessToken,
        refreshTokenId: res.data.data.refreshTokenId,
      };
    } catch (err: any) {
      console.error("💥 [auth-service] 네트워크 에러:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
      });
      throw err;
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
  async logout(accessToken: string, refreshTokenId: string): Promise<void> {
    await axios.delete(`${BASE_URL}/api/auth/logout/${refreshTokenId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
