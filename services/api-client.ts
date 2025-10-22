import { getDeviceId } from "@/utils/deviceInfo";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_ID_KEY = "refresh_token_id";
const DEVICE_ID_KEY = "device_id";
const USER_KEY = "user_info";

// Axios 인스턴스 생성 (baseURL 없이 - 각 서비스에서 full URL 사용)
export const apiClient = axios.create({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 리프레시 중인지 확인하는 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 토큰 리프레시 대기 중인 요청들을 처리
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request Interceptor: 요청마다 accessToken 자동 추가
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 시 토큰 리프레시
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 이미 리프레시 중이면 대기
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const refreshTokenId = await SecureStore.getItemAsync(REFRESH_ID_KEY);
        let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

        // deviceId가 없으면 새로 생성
        if (!deviceId) {
          deviceId = await getDeviceId();
          await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
          console.log("📱 [Token Refresh] deviceId 새로 생성:", deviceId);
        }

        if (!accessToken || !refreshTokenId || !deviceId) {
          throw new Error("토큰 정보가 없습니다.");
        }

        console.log("🔄 [Token Refresh] 토큰 갱신 시작...");
        console.log("📦 [Token Refresh] refreshTokenId:", refreshTokenId);
        console.log("📱 [Token Refresh] deviceId:", deviceId);

        // 토큰 리프레시 API 호출
        const BASE_URL = process.env.EXPO_PUBLIC_USER_URL;
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {
            deviceId: deviceId,
            refreshTokenId: refreshTokenId,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const newAccessToken = response.data.data.accessToken;

        // 새 토큰 저장
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
        console.log("✅ [Token Refresh] 새 토큰 저장 완료");

        // 대기 중인 요청들에게 새 토큰 전달
        onTokenRefreshed(newAccessToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ [Token Refresh] 토큰 갱신 실패:", refreshError);

        // 리프레시 실패 시 로그아웃 처리
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_ID_KEY);
        await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);

        // 로그인 화면으로 리다이렉트는 AuthContext에서 처리
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
