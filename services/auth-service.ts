import { SignUpPayload, User } from "@/types/auth";

export const authService = {
  async signIn(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    // DEV: 실제 API 호출 자리
    return {
      token: "demo.jwt.token",
      user: { id: "1", name: "홍길동", email },
    };
  },

  async signUp(payload: SignUpPayload): Promise<{ token: string; user: User }> {
    // DEV: 실제 API 호출 자리
    return {
      token: "demo.jwt.token",
      user: { id: "2", name: payload.name, email: payload.email },
    };
  },

  async me(token: string): Promise<User | null> {
    // DEV: 토큰 검증 API 자리
    return token
      ? { id: "1", name: "홍길동", email: "hong@example.com" }
      : null;
  },
};
