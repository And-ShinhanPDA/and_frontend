// app/_layout.tsx
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { setWidgetViewType } from "@/services/widgetShare";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

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
