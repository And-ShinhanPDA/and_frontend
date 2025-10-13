import { AuthResponse, SignInPayload, SignUpPayload, User } from "@/types/auth";
import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const authService = {
  // 회원가입
  async signUp(payload: SignUpPayload): Promise<User> {
    const res = await axios.post<AuthResponse<User>>(
      `${BASE_URL}/user/api/auth/signup`,
      payload
    );
    return res.data.data;
  },
  // 로그인
  async signIn(payload: SignInPayload): Promise<{
    user: User;
    accessToken: string;
    refreshTokenId: string;
  }> {
    const res = await axios.post<
      AuthResponse<{
        userId: number;
        email: string;
        name: string;
        accessToken: string;
        refreshTokenId: string;
      }>
    >(`${BASE_URL}/user/api/auth/login`, payload);

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
  },

  // 토큰 만료 시 재발급
  async refresh(accessToken: string, refreshTokenId: string): Promise<string> {
    const res = await axios.post<AuthResponse<{ accessToken: string }>>(
      `${BASE_URL}/user/api/auth/refresh`,
      { refreshTokenId },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return res.data.data.accessToken;
  },

  // 로그아웃
  async logout(accessToken: string, refreshTokenId: string): Promise<void> {
    await axios.delete(`${BASE_URL}/user/api/auth/logout/${refreshTokenId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};
