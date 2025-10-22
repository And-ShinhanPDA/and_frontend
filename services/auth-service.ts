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

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📤 [로그아웃 API] 요청 시작");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 URL:", url);
    console.log("");
    console.log("📦 Request Body (JSON):");
    console.log(JSON.stringify(requestBody, null, 2));
    console.log("");
    console.log("🔑 Headers:");
    console.log("  - Authorization:", `Bearer ${accessToken.substring(0, 30)}...`);
    console.log("");
    console.log("📝 전체 요청 정보:");
    console.log("  - Method: DELETE");
    console.log("  - deviceId:", deviceId);
    console.log("  - deviceId 타입:", typeof deviceId);
    console.log("  - deviceId 길이:", deviceId?.length || 0);
    console.log("  - refreshTokenId:", refreshTokenId);
    console.log("  - refreshTokenId 타입:", typeof refreshTokenId);
    console.log("  - refreshTokenId 길이:", refreshTokenId?.length || 0);
    console.log("  - accessToken 길이:", accessToken?.length || 0);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      const res = await axios.delete<AuthResponse<string>>(url, {
        headers,
        data: requestBody,
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      });

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📥 [로그아웃 API] 응답 수신");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📊 응답 상태:", res.status);
      console.log("📄 응답 데이터:", JSON.stringify(res.data, null, 2));

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || `로그아웃에 실패했습니다.`);
      }

      console.log("✅ [로그아웃] 성공!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("❌ [로그아웃] 실패");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error("에러 메시지:", errorMsg);
      console.error("에러 상태 코드:", err.response?.status);
      console.error("에러 응답 데이터:", JSON.stringify(err.response?.data, null, 2));
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      throw new Error(errorMsg);
    }
  },
};
