import notifee from '@notifee/react-native';
import messaging from "@react-native-firebase/messaging";
import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

// ✅ 알림 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ✅ 백그라운드 메시지 핸들러 (최상위 레벨에서 설정 - 필수!)
// 주의: iOS에서는 notification 필드가 있으면 자동으로 시스템 알림이 표시됩니다.
// 이 핸들러는 data-only 메시지나 추가 처리가 필요한 경우에 사용됩니다.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("🔔 [Background Message]", JSON.stringify(remoteMessage));
  
  // 백그라운드 데이터 처리 (예: 로컬 DB 업데이트 등)
  // iOS는 notification 필드가 있으면 자동으로 알림을 표시합니다.
});

function RouterGate() {
  const { isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Pretendard200: require("../assets/fonts/Pretendard-ExtraLight.ttf"),
    Pretendard400: require("../assets/fonts/Pretendard-Regular.ttf"),
    Pretendard500: require("../assets/fonts/Pretendard-Medium.ttf"),
    Pretendard600: require("../assets/fonts/Pretendard-SemiBold.ttf"),
    Pretendard700: require("../assets/fonts/Pretendard-Bold.ttf"),
    Pretendard900: require("../assets/fonts/Pretendard-Black.ttf"),
  });

  // ✅ Notifee 권한 요청 및 설정
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Notifee 알림 권한 요청
        const settings = await notifee.requestPermission();
        console.log('📋 [Notifee] 알림 권한 상태:', settings);
        
        // iOS 카테고리 설정
        await notifee.setNotificationCategories([
          {
            id: 'default',
            actions: [
              {
                id: 'default',
                title: '확인',
              },
            ],
          },
        ]);
        
        // 알림 채널 생성 (Android용)
        await notifee.createChannel({
          id: 'default',
          name: '기본 알림',
          sound: 'default',
        });
        
        console.log('✅ [Notifee] 초기화 완료');
      } catch (error) {
        console.error('❌ [Notifee] 초기화 실패:', error);
      }
    };
    
    setupNotifications();
  }, []);

  // ✅ 포어그라운드 메시지 → iOS 시스템 알림으로 표시
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("🔔 [Foreground Message]", JSON.stringify(remoteMessage));
      
      try {
        // iOS에서 제대로 표시되도록 채널 ID와 함께 알림 생성
        const channelId = await notifee.createChannel({
          id: 'important',
          name: '중요 알림',
          importance: 4, // AndroidImportance.HIGH
          sound: 'default',
        });
        
        // Notifee를 사용하여 iOS 시스템 알림 표시
        const notificationId = await notifee.displayNotification({
          title: remoteMessage.notification?.title || "알림",
          body: remoteMessage.notification?.body || "",
          ios: {
            sound: 'default',
            categoryId: 'default',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            channelId,
            sound: 'default',
            pressAction: {
              id: 'default',
            },
          },
          data: remoteMessage.data,
        });
        
        console.log("✅ 알림 표시 완료, ID:", notificationId);
      } catch (error) {
        console.error("❌ 알림 표시 실패:", error);
      }
    });
    return unsubscribe;
  }, []);

  // ✅ 알림 클릭 시 처리
  useEffect(() => {
    // Notifee 알림 클릭 이벤트
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      console.log("👆 [Notification Event]", type, detail);
      
      if (type === 1) { // EventType.PRESS
        const data = detail.notification?.data;
        console.log("👆 [Notification Clicked]", data);
        // TODO: 알림 클릭 시 특정 화면으로 이동
        // router.push(`/detail/${data.id}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 글꼴 로딩 후 스플래시 종료
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RouterGate />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}