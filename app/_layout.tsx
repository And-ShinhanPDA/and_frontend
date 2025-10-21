// app/_layout.tsx
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Linking, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import notifee from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

// ✅ 앱이 background/quit(종료) 상태인 경우 메시지를 받기 위함
messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
  console.log("[Background Message] ", remoteMessage);
});

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
  const router = useRouter();

  // 위젯 딥링크 핸들러 설정
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      console.log("📲 [Deep Link] URL 수신:", url);

      // myapp://alert-company-alertDetail?id=123&stockCode=005930&name=삼성전자
      // myapp://alert-condition-companyList?id=123&name=조건명

      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const searchParams = new URLSearchParams(urlObj.search);

        console.log("📲 [Deep Link] Parsed:", {
          hostname,
          params: Object.fromEntries(searchParams),
        });

        if (hostname === "alert-company-alertDetail") {
          const alertId = searchParams.get("id");
          const stockCode = searchParams.get("stockCode");
          const name = searchParams.get("name");

          if (alertId && stockCode) {
            console.log(
              `📲 [Deep Link] 기업 알림 상세로 이동: ${name} (${stockCode})`
            );

            // 네비게이션 스택 구성: 기업 알림 목록 → 기업 상세 → 알림 상세
            // 1. 먼저 기업 알림 목록 화면으로 이동
            router.replace("/(tabs)/(alert-company)");

            // 2. 약간의 딜레이 후 기업 상세 화면을 push
            setTimeout(() => {
              router.push({
                pathname: "/(tabs)/(alert-company)/(alert-company-detail)/[id]",
                params: {
                  id: stockCode,
                  name: name || "", // 기업명 전달
                },
              });

              // 3. 그 다음 알림 상세 화면을 push
              setTimeout(() => {
                router.push({
                  pathname:
                    "/(tabs)/(alert-company)/(alert-company-alertDetail)/[id]",
                  params: {
                    id: alertId,
                    stockCode: stockCode,
                    companyName: name || "",
                  },
                });
              }, 100);
            }, 100);
          }
        } else if (hostname === "alert-condition-companyList") {
          const id = searchParams.get("id");
          const name = searchParams.get("name");

          if (id) {
            console.log(
              `📲 [Deep Link] 조건 검색 상세로 이동: ${name} (${id})`
            );

            // 네비게이션 스택 구성: 조건 검색 목록 → 조건 상세 (기업 리스트)
            // 1. 먼저 조건 검색 목록 화면으로 이동
            router.replace("/(tabs)/(alert-condition)");

            // 2. 그 다음 조건 상세 (기업 리스트) 화면으로 push
            setTimeout(() => {
              router.push({
                pathname:
                  "/(tabs)/(alert-condition)/(alert-condition-companyList)/[id]",
                params: { id, name: name || "", tags: "[]" },
              });
            }, 100);
          }
        }
      } catch (error) {
        console.error("📲 [Deep Link] URL 파싱 에러:", error);
      }
    };

    // 앱 실행 중 딥링크 수신
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // 앱이 종료된 상태에서 딥링크로 열린 경우
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("📲 [Deep Link] 앱 실행 시 초기 URL:", url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isLoggedIn]);

  // Foreground 알림 핸들러 설정
  useEffect(() => {
    if (!isLoggedIn) return;

    // 앱이 foreground 상태일 때 알림 수신
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage) => {
        console.log("📱 [Notification] 포어그라운드 알림 수신:", remoteMessage);

        try {
          // notifee를 사용하여 시스템 알림 표시
          await notifee.displayNotification({
            title: remoteMessage.notification?.title || "알림",
            body: remoteMessage.notification?.body || "",
            android: {
              channelId: "default",
              smallIcon: "ic_launcher",
              pressAction: {
                id: "default",
              },
            },
            ios: {
              foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
              },
            },
          });
          console.log("✅ [Notification] 포어그라운드 알림 표시 완료");
        } catch (error) {
          console.error(
            "❌ [Notification] 포어그라운드 알림 표시 실패:",
            error
          );
        }
      }
    );

    return () => {
      unsubscribeForeground();
    };
  }, [isLoggedIn]);

  // 알림 터치 핸들러 설정
  useEffect(() => {
    if (!isLoggedIn) return;

    // 백그라운드 상태에서 알림 터치 시
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log(
          "📱 [Notification] 알림 터치됨 (Background):",
          remoteMessage
        );
        router.push("/(tabs)/(alert-history)");
      }
    );

    // 앱이 종료된 상태에서 알림 터치로 열린 경우
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "📱 [Notification] 알림 터치로 앱 실행됨 (Quit state):",
            remoteMessage
          );
          // 약간의 딜레이 후 이동 (앱 초기화 대기)
          setTimeout(() => {
            router.push("/(tabs)/(alert-history)");
          }, 1000);
        }
      });

    return () => {
      unsubscribeBackground();
    };
  }, [isLoggedIn]);

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

  // ✅ Notifee 초기화 (foreground 알림용)
  useEffect(() => {
    const initNotifee = async () => {
      try {
        // Android 채널 생성
        await notifee.createChannel({
          id: "default",
          name: "기본 알림",
          importance: 4, // High importance
          sound: "default",
        });

        console.log("✅ [Notifee] 채널 초기화 완료");
      } catch (error) {
        console.error("❌ [Notifee] 초기화 실패:", error);
      }
    };

    initNotifee();
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

  // ✅ 위젯 관련 딥링크 처리 - 전체 주석처리
  // useEffect(() => {
  //   const handleDeepLink = (event: Linking.EventType) => {
  //     const { path, queryParams } = Linking.parse(event.url);

  //     if (
  //       queryParams?.view === "companies" ||
  //       queryParams?.view === "conditions"
  //     ) {
  //       const viewType = queryParams.view as "companies" | "conditions";
  //       console.log("📲 위젯에서 받은 요청:", viewType);

  //       // App Group에 viewType 저장 → Swift 위젯이 읽어서 전환
  //       setWidgetViewType(viewType);
  //     }
  //   };

  //   // 앱 실행 중 수신되는 URL
  //   const sub = Linking.addEventListener("url", handleDeepLink);

  //   // 앱 처음 켜질 때 URL이 있었는지 확인
  //   Linking.getInitialURL().then((url) => {
  //     if (!url) return;
  //     const { queryParams } = Linking.parse(url);
  //     if (
  //       queryParams?.view === "companies" ||
  //       queryParams?.view === "conditions"
  //     ) {
  //       const viewType = queryParams.view as "companies" | "conditions";
  //       setWidgetViewType(viewType);
  //     }
  //   });

  //   return () => sub.remove();
  // }, []);

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
