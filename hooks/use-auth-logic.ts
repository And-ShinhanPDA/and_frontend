import { authService } from "@/services/auth-service";
import { SignInPayload, SignUpPayload, User } from "@/types/auth";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_ID_KEY = "refresh_token_id";
const USER_KEY = "user_info";

export function useAuthLogic() {
  const [isReady, setIsReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenId, setRefreshTokenId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const savedAccess = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const savedRefresh = await SecureStore.getItemAsync(REFRESH_ID_KEY);
        const savedUser = await SecureStore.getItemAsync(USER_KEY);

        console.log("=== 앱 시작 시 복원 ===");
        console.log("savedAccess:", savedAccess);
        console.log("savedRefresh:", savedRefresh);
        console.log("savedUser:", savedUser);

        if (savedAccess && savedRefresh) {
          setAccessToken(savedAccess);
          setRefreshTokenId(savedRefresh);

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log("복원된 user:", parsedUser);
            setUser(parsedUser);
          }
        }
      } catch (e) {
        console.warn("Auth restore error", e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // 로그인
  const signIn = useCallback(async ({ email, password }: SignInPayload) => {
    const { user, accessToken, refreshTokenId } = await authService.signIn({
      email,
      password,
    });

    console.log("=== 로그인 성공 ===");
    console.log("로그인한 user:", user);

    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, String(accessToken));
    await SecureStore.setItemAsync(REFRESH_ID_KEY, String(refreshTokenId));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    setAccessToken(accessToken);
    setRefreshTokenId(refreshTokenId);
    setUser(user);
  }, []);

  // 회원가입
  const signUp = useCallback(
    async ({ name, email, password, fcmToken, deviceId }: SignUpPayload) => {
      console.log("🔄 [useAuthLogic] signUp 호출:", { name, email, fcmToken, deviceId });
      const user = await authService.signUp({ 
        name, 
        email, 
        password, 
        fcmToken, 
        deviceId 
      });
      setUser(user);
    },
    []
  );

  // 토큰 리프레시
  const refreshAccessToken = useCallback(async () => {
    try {
      if (!accessToken || !refreshTokenId) {
        throw new Error("토큰 정보가 없습니다.");
      }

      console.log("🔄 [Auth] 토큰 갱신 시작...");
      const newAccessToken = await authService.refresh(accessToken, refreshTokenId);

      // 새 토큰 저장
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
      setAccessToken(newAccessToken);

      console.log("✅ [Auth] 토큰 갱신 완료");
      return newAccessToken;
    } catch (error) {
      console.error("❌ [Auth] 토큰 갱신 실패:", error);
      // 리프레시 실패 시 로그아웃
      await signOut();
      throw error;
    }
  }, [accessToken, refreshTokenId]);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      if (accessToken && refreshTokenId) {
        // await authService.logout(accessToken, refreshTokenId);
      }
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_ID_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      setUser(null);
      setAccessToken(null);
      setRefreshTokenId(null);
    }
  }, [accessToken, refreshTokenId]);

  return useMemo(
    () => ({
      isReady,
      isLoggedIn: Boolean(user && accessToken),
      accessToken,
      refreshTokenId,
      user,
      signIn,
      signUp,
      signOut,
      refreshAccessToken,
    }),
    [isReady, user, accessToken, refreshTokenId, signIn, signUp, signOut, refreshAccessToken]
  );
}
