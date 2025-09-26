// app/_layout.tsx
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

function RouterGate() {
  const { isReady, isLoggedIn } = useAuth();

  // 로그인 화면으로 안 넘어감
  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
      }}
    ></Stack>
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
