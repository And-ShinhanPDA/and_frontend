// app/(tabs)/_layout.tsx
import { useAuth } from "@/contexts/AuthContext";
import messaging from "@react-native-firebase/messaging";
import { Redirect, Stack } from "expo-router";
import React, { useEffect } from "react";

export default function TabLayout() {
  const { isLoggedIn } = useAuth();

  // 로그인 후 FCM 포어그라운드 메시지 핸들러만 설정
  useEffect(() => {
    if (isLoggedIn) {
      console.log("🔔 [FCM] 포어그라운드 메시지 핸들러 설정 시작...");

      // 포어그라운드 메시지 핸들러만 설정 (백그라운드는 _layout.tsx에서 처리)
      const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        console.log("🔔 [Foreground Message]", JSON.stringify(remoteMessage));
      });

      console.log("✅ [FCM] 포어그라운드 메시지 핸들러 설정 완료");

      return () => {
        unsubscribe();
      };
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        animationDuration: 0,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(home)/index" />
      <Stack.Screen name="(alert-condition)" />
      <Stack.Screen name="(alert-condition-detail)/[id]" />
      <Stack.Screen name="(alert-condition-modify)/[id]" />
      <Stack.Screen name="(alert-condition-companyList)/[id]" />
      <Stack.Screen name="(alert-company)" />
      <Stack.Screen name="(alert-company-additional)/[id]" />
      <Stack.Screen name="(alert-company-detail)/[id]" />
      <Stack.Screen name="(alert-company-alertDetail)/[id]" />
      <Stack.Screen name="(alert-company-alertModify)/[id]" />
      <Stack.Screen name="(chart)/index" />
      <Stack.Screen name="(chart)/[chartId]" />
      <Stack.Screen name="(alert-history)/index" />
    </Stack>
  );
}
