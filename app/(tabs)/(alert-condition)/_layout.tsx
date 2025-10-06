// app/(tabs)/(alert-condition)/_layout.tsx
import { Stack } from "expo-router";

export default function AlertConditionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="alert-condition" />
    </Stack>
  );
}
