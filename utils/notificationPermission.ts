import messaging from "@react-native-firebase/messaging";

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("✅ [Notification] 권한 승인됨");
    } else {
      console.log("❌ [Notification] 권한 거부됨");
    }

    return enabled;
  } catch (error) {
    console.error("❌ [Notification] 권한 요청 실패:", error);
    return false;
  }
}

/**
 * 현재 알림 권한 상태 확인
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    console.error("❌ [Notification] 권한 확인 실패:", error);
    return false;
  }
}

