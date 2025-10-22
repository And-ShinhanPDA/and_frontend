import { authService } from "@/services/auth-service";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_ID_KEY = "refresh_token_id";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

/**
 * API 호출을 래핑하여 401 에러 시 자동으로 토큰을 갱신하고 재시도
 */
export async function apiCallWithRefresh<T>(
  apiCall: (token: string) => Promise<T>,
  currentToken: string
): Promise<T> {
  try {
    return await apiCall(currentToken);
  } catch (error: any) {
    // 401 에러가 아니면 그대로 throw
    if (error.response?.status !== 401) {
      throw error;
    }

    console.log("🔄 [API Wrapper] 401 에러 감지 - 토큰 갱신 시도");

    // 이미 리프레시 중이면 기존 Promise 재사용
    if (isRefreshing && refreshPromise) {
      const newToken = await refreshPromise;
      return await apiCall(newToken);
    }

    // 토큰 리프레시 시작
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const refreshTokenId = await SecureStore.getItemAsync(REFRESH_ID_KEY);

        if (!accessToken || !refreshTokenId) {
          throw new Error("토큰 정보가 없습니다.");
        }

        const newAccessToken = await authService.refresh(accessToken, refreshTokenId);

        // 새 토큰 저장
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
        console.log("✅ [API Wrapper] 토큰 갱신 및 저장 완료");

        return newAccessToken;
      } catch (refreshError) {
        console.error("❌ [API Wrapper] 토큰 갱신 실패:", refreshError);
        
        // 리프레시 실패 시 로그아웃
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_ID_KEY);
        await SecureStore.deleteItemAsync("user_info");

        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    const newToken = await refreshPromise;
    
    // 새 토큰으로 원래 요청 재시도
    return await apiCall(newToken);
  }
}

