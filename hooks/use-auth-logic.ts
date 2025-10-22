import { authService } from "@/services/auth-service";
import { SignInPayload, SignUpPayload, User } from "@/types/auth";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from "react";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_ID_KEY = "refresh_token_id";
const DEVICE_ID_KEY = "device_id";
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

  // 로그인: 이메일, 패스워드, FCM 토큰, 디바이스 ID
  const signIn = useCallback(async ({ email, password, fcmToken, deviceId }: SignInPayload) => {
    const { user, accessToken, refreshTokenId } = await authService.signIn({
      email,
      password,
      fcmToken,
      deviceId,
    });

    console.log("=== 로그인 성공 ===");
    console.log("로그인한 user:", user);

    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, String(accessToken));
    await SecureStore.setItemAsync(REFRESH_ID_KEY, String(refreshTokenId));
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    
    // deviceId 저장 (리프레시 토큰용)
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    console.log("📱 [로그인] deviceId 저장:", deviceId);

    setAccessToken(accessToken);
    setRefreshTokenId(refreshTokenId);
    setUser(user);
  }, []);

  // 회원가입: 이메일, 이름, 패스워드만
  const signUp = useCallback(
    async ({ name, email, password }: SignUpPayload) => {
      console.log("🔄 [useAuthLogic] signUp 호출:", { name, email });
      const user = await authService.signUp({ 
        name, 
        email, 
        password,
      });
      
      console.log("✅ [useAuthLogic] 회원가입 완료:", user);
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
      console.log("╔═══════════════════════════════════════════════╗");
      console.log("║           로그아웃 프로세스 시작             ║");
      console.log("╚═══════════════════════════════════════════════╝");
      
      if (accessToken && refreshTokenId) {
        // deviceId를 SecureStore에서 가져오기
        const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        
        console.log("");
        console.log("📋 [로그아웃] SecureStore에서 가져온 값:");
        console.log("┌─────────────────────────────────────────────┐");
        console.log("│ accessToken 존재:", !!accessToken);
        console.log("│ accessToken 길이:", accessToken?.length || 0);
        console.log("│ accessToken 앞부분:", accessToken?.substring(0, 30) + "...");
        console.log("├─────────────────────────────────────────────┤");
        console.log("│ refreshTokenId:", refreshTokenId);
        console.log("│ refreshTokenId 타입:", typeof refreshTokenId);
        console.log("│ refreshTokenId 길이:", refreshTokenId?.length || 0);
        console.log("├─────────────────────────────────────────────┤");
        console.log("│ deviceId:", deviceId);
        console.log("│ deviceId 타입:", typeof deviceId);
        console.log("│ deviceId 길이:", deviceId?.length || 0);
        console.log("└─────────────────────────────────────────────┘");
        console.log("");
        
        if (deviceId) {
          console.log("✅ deviceId 존재 → authService.logout() 호출");
          await authService.logout(accessToken, refreshTokenId, deviceId);
        } else {
          console.warn("⚠️ [로그아웃] deviceId가 없어서 API 호출을 건너뜁니다.");
        }
      } else {
        console.log("⚠️ accessToken 또는 refreshTokenId가 없습니다.");
        console.log("  - accessToken:", !!accessToken);
        console.log("  - refreshTokenId:", !!refreshTokenId);
      }
    } catch (error) {
      console.error("❌ [로그아웃] API 호출 실패:", error);
    } finally {
      console.log("");
      console.log("🧹 [로그아웃] SecureStore 데이터 삭제 중...");
      
      // 로컬 저장소 정리
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_ID_KEY);
      await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      // 상태 초기화
      setUser(null);
      setAccessToken(null);
      setRefreshTokenId(null);
      
      console.log("✅ [로그아웃] 로컬 데이터 정리 완료");
      console.log("╔═══════════════════════════════════════════════╗");
      console.log("║           로그아웃 프로세스 완료             ║");
      console.log("╚═══════════════════════════════════════════════╝");
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
