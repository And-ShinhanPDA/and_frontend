import { authService } from "@/services/auth-service";
import { SignInPayload, SignUpPayload, User } from "@/types/auth";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_ID_KEY = "refresh_token_id";

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

        if (savedAccess && savedRefresh) {
          setAccessToken(savedAccess);
          setRefreshTokenId(savedRefresh);
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

    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, String(accessToken));
    await SecureStore.setItemAsync(REFRESH_ID_KEY, String(refreshTokenId));

    setAccessToken(accessToken);
    setRefreshTokenId(refreshTokenId);
    setUser(user);
  }, []);

  // 회원가입
  const signUp = useCallback(
    async ({ name, email, password }: SignUpPayload) => {
      const user = await authService.signUp({ name, email, password });
      setUser(user);
    },
    []
  );

  // 로그아웃
  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_ID_KEY);
    setUser(null);
    setAccessToken(null);
    setRefreshTokenId(null);
  }, []);

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
    }),
    [isReady, user, accessToken, refreshTokenId, signIn, signUp, signOut]
  );
}
