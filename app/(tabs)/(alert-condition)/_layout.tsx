// app/(tabs)/(alert-condition)/_layout.tsx
import { Stack } from "expo-router";

export default function AlertConditionLayout() {
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
      <Stack.Screen name="[alertId]" />
    </Stack>
  );
}
