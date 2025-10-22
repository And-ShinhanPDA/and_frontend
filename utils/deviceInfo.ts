import messaging from "@react-native-firebase/messaging";
import Constants from "expo-constants";
import DeviceInfo from "react-native-device-info";

/**
 * FCM 토큰 가져오기
 */
export async function getFCMToken(): Promise<string> {
  try {
    const messagingInstance = messaging();
    
    // iOS에서 필요한 경우 디바이스 등록
    if (!messagingInstance.isDeviceRegisteredForRemoteMessages) {
      await messagingInstance.registerDeviceForRemoteMessages();
    }

    const token = await messagingInstance.getToken();
    
    if (token) {
      console.log("✅ [FCM] 토큰 발급 성공");
      return token;
    } else {
      console.log("⚠️ [FCM] 토큰이 없습니다");
      return "";
    }
  } catch (error) {
    console.error("❌ [FCM] 토큰 발급 실패:", error);
    return "";
  }
}

/**
 * 디바이스 고유 ID 가져오기
 */
export async function getDeviceId(): Promise<string> {
  try {
    const uniqueId = await DeviceInfo.getUniqueId();
    console.log("🆔 [Device] Unique ID:", uniqueId);
    return uniqueId;
  } catch (error) {
    console.error("❌ [Device] ID 조회 실패, fallback 사용:", error);
    // fallback으로 Expo의 sessionId 사용
    return Constants.sessionId || "unknown";
  }
}

