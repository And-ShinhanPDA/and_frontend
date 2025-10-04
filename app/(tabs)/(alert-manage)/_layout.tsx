// app/(tabs)/(alert-manage)/_layout.tsx
import { Stack } from "expo-router";

export default function AlertManageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="alert-manage" />
      <Stack.Screen name="alert-condition" />
    </Stack>
  );
}
