// utils/deviceInfo.ts
import messaging from "@react-native-firebase/messaging";
import Constants from "expo-constants";
import * as Device from "expo-device";
import DeviceInfo from "react-native-device-info";

/**
 * FCM 토큰 가져오기 (권한이 있을 때만)
 * 권한 요청은 하지 않고, 이미 권한이 있는 경우에만 토큰 반환
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // 권한 확인만 하고 요청은 하지 않음
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("⚠️ [FCM] 알림 권한 없음 - 토큰 발급 불가");
      return null;
    }

    // iOS에서 원활한 토큰 발급을 위해 등록 보장
    try {
      await messaging().registerDeviceForRemoteMessages();
    } catch (e) {
      console.log("⚠️ [FCM] registerDeviceForRemoteMessages 스킵:", e);
    }

    // FCM 토큰 생성
    const token = await messaging().getToken();
    console.log("✅ [FCM] 토큰 발급 성공");
    return token;
  } catch (error) {
    console.error("❌ [FCM] 토큰 가져오기 실패:", error);
    return null;
  }
};

/**
 * 디바이스 ID를 가져오는 함수
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    const uniqueId = await DeviceInfo.getUniqueId();
    console.log("🆔 [Device] Unique ID:", uniqueId);
    return uniqueId;
  } catch (e) {
    console.warn("❗ [Device] getUniqueId failed, fallback to sessionId:", e);
    const fallbackId = Constants.sessionId;
    console.log("🆔 [Device] Fallback Session ID:", fallbackId);
    return fallbackId;
  }
};

/**
 * 디바이스 정보를 로그로 출력하는 함수
 */
export const logDeviceInfo = async () => {
  const deviceId = await getDeviceId();
  const deviceName = Device.deviceName;
  const modelName = Device.modelName;
  const osVersion = Device.osVersion;
  const brand = Device.brand;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📱 Device Information");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🆔 Device ID (Session):", deviceId);
  console.log("📱 Device Name:", deviceName);
  console.log("📲 Model Name:", modelName);
  console.log("🍎 Brand:", brand);
  console.log("📊 OS Version:", osVersion);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
};
