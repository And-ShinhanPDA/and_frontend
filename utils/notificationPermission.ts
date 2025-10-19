// utils/notificationPermission.ts
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("❌ [Notification] 권한 거부됨");
        return false;
      }

      console.log("✅ [Notification] iOS 권한 승인됨");
    }

    // Android는 자동으로 권한이 부여됨 (Android 13 미만)
    // Android 13+는 별도 처리 필요할 수 있음
    return true;
  } catch (error) {
    console.error("❌ [Notification] 권한 요청 실패:", error);
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error("❌ [Notification] 권한 확인 실패:", error);
    return false;
  }
}
