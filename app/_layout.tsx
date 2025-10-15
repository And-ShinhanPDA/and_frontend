// app/_layout.tsx
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setWidgetViewType } from "@/services/widgetShare";
// import messaging from "@react-native-firebase/messaging"; // ✅ 임시 주석처리
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

// ✅ 앱이 background/quit(종료) 상태인 경우 메시지를 받기 위함
// messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
//   console.log("[Background Message] ", remoteMessage);
// });

// ✅ FCM 권한 요청 및 토큰 생성
const requestUserPermission = async () => {
  try {
    // ✅ 임시 주석처리
    // const authorizationStatus = await messaging().requestPermission();

    // if (authorizationStatus) {
    //   // FCM 토큰 생성
    //   const token = await messaging().getToken();

    // 디바이스 정보
    const deviceId = Constants.sessionId; // 세션 ID
    const deviceName = Device.deviceName; // 기기 이름 (예: "여은동의 iPhone")
    const modelName = Device.modelName; // 모델명 (예: "iPhone 16 Pro")
    const osVersion = Device.osVersion; // OS 버전
    const brand = Device.brand; // 브랜드 (Apple)

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 Device Information");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🆔 Device ID (Session):", deviceId);
    console.log("📱 Device Name:", deviceName);
    console.log("📲 Model Name:", modelName);
    console.log("🍎 Brand:", brand);
    console.log("📊 OS Version:", osVersion);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    // console.log("🔥 FCM Token Information");
    // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    // console.log("🔑 FCM Token:", token);
    // console.log("✅ Authorization Status:", authorizationStatus);
    // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // return token;
    // }
  } catch (error) {
    console.error("❌ Error requesting permission:", error);
  }
};

function RouterGate() {
  const { isReady, isLoggedIn } = useAuth();

  // 로딩 중
  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 로그인 여부와 관계없이 Stack만 보여줌
  // KeyboardAvoidingView 제거 - 화면이 밀리는 것 방지
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

  // ✅ iOS 권한 요청 및 FCM 토큰 받기
  useEffect(() => {
    requestUserPermission();
  }, []);

  // ✅ 앱이 foreground(실행) 상태인 경우 메시지를 받기 위함
  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     console.log("[Foreground Message] ", JSON.stringify(remoteMessage));

  //     // 필요하면 Alert 표시
  //     if (remoteMessage.notification) {
  //       Alert.alert(
  //         remoteMessage.notification.title || "알림",
  //         remoteMessage.notification.body || ""
  //       );
  //     }
  //   });

  //   return unsubscribe;
  // }, []);

  // ✅ FCM 토큰 갱신 감지
  // useEffect(() => {
  //   const unsubscribe = messaging().onTokenRefresh((token) => {
  //     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  //     console.log("🔄 FCM Token Refreshed!");
  //     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  //     console.log("🔑 New FCM Token:", token);
  //     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  //   });

  //   return unsubscribe;
  // }, []);

  // 위젯에서 넘어오는 딥링크 감지
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const { path, queryParams } = Linking.parse(event.url);

      if (
        queryParams?.view === "companies" ||
        queryParams?.view === "conditions"
      ) {
        const viewType = queryParams.view as "companies" | "conditions";
        console.log("📲 위젯에서 받은 요청:", viewType);

        // App Group에 viewType 저장 → Swift 위젯이 읽어서 전환
        setWidgetViewType(viewType);
      }
    };

    // 앱 실행 중 수신되는 URL
    const sub = Linking.addEventListener("url", handleDeepLink);

    // 앱 처음 켜질 때 URL이 있었는지 확인
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      if (
        queryParams?.view === "companies" ||
        queryParams?.view === "conditions"
      ) {
        const viewType = queryParams.view as "companies" | "conditions";
        setWidgetViewType(viewType);
      }
    });

    return () => sub.remove();
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
