// app/(tabs)/_layout.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
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
