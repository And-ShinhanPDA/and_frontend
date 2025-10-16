// app/(tabs)/(alert-manage)/_layout.tsx
import { Stack } from "expo-router";

export default function AlertManageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        animationDuration: 0,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="alert-company" />
    </Stack>
  );
}
