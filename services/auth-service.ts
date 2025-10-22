import { AuthResponse, SignInPayload, SignUpPayload, User } from "@/types/auth";
import { getErrorMessage } from "@/utils/errorHandler";
import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_USER_URL;

export const authService = {
  // 회원가입: 이메일, 이름, 패스워드만 전송
  async signUp(payload: SignUpPayload): Promise<User> {
    const url = `${BASE_URL}/api/auth/signup`;

    const requestBody = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    };

    console.log("📤 [회원가입] 요청 데이터:", requestBody);

    try {
      const res = await axios.post<AuthResponse<User>>(url, requestBody, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      console.log("📥 [회원가입] 응답 상태:", res.status);

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `회원가입에 실패했습니다.`);
      }

      console.log("✅ [회원가입] 성공:", res.data.data);
      return res.data.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      console.error("❌ [회원가입] 실패:", errorMsg);
      throw new Error(errorMsg);
    }
  },
  // 로그인: 이메일, 패스워드, FCM 토큰, 디바이스 ID 전송
  async signIn(payload: SignInPayload): Promise<{
    user: User;
    accessToken: string;
    refreshTokenId: string;
  }> {
    const url = `${BASE_URL}/api/auth/login`;

    const requestBody = {
      email: payload.email,
      password: payload.password,
      fcmToken: payload.fcmToken,
      deviceId: payload.deviceId,
    };

    console.log("📤 [로그인] 요청 데이터:", {
      email: requestBody.email,
      password: "***",
      fcmToken: requestBody.fcmToken
        ? `${requestBody.fcmToken.substring(0, 20)}...`
        : "없음",
      deviceId: requestBody.deviceId,
    });

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
      >(url, requestBody, {
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      console.log("📥 [로그인] 응답 상태:", res.status);

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `로그인에 실패했습니다.`);
      }

      const user: User = {
        id: res.data.data.userId,
        email: res.data.data.email,
        name: res.data.data.name,
      };

      console.log("✅ [로그인] 성공:", {
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      return {
        user,
        accessToken: res.data.data.accessToken,
        refreshTokenId: res.data.data.refreshTokenId,
      };
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      console.error("❌ [로그인] 실패:", errorMsg);
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

    console.log("📤 [로그아웃] 요청 데이터:", requestBody);

    try {
      const res = await axios.delete<AuthResponse<string>>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: requestBody,
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      console.log("📥 [로그아웃] 응답 상태:", res.status);

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `로그아웃에 실패했습니다.`);
      }

      console.log("✅ [로그아웃] 성공:", res.data.message);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      console.error("❌ [로그아웃] 실패:", errorMsg);
      throw new Error(errorMsg);
    }
  },
};
