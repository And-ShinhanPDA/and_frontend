import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Typography } from "@/components/ui/Typography";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isReady, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href={"/login"} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarButton: HapticTab,
        headerTitleAlign: "left",

        headerTitle: ({ children }) => (
          <Typography weight="600" size={18}>
            {children}
          </Typography>
        ),

        headerRight: () => (
          <Pressable onPress={() => console.log("마이페이지 이동")}>
            <Ionicons name="person-circle-outline" size={28} color="black" />
          </Pressable>
        ),

        tabBarLabel: ({ focused, children }) => (
          <Typography weight={focused ? "600" : "400"} size={12}>
            {children}
          </Typography>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alert-manage/alert-manage"
        options={{
          title: "내 알림",
          tabBarLabel: ({ focused }) => (
            <Typography weight={focused ? "600" : "400"} size={12}>
              알림
            </Typography>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),

          headerRight: () => (
            <>
              <Pressable
                onPress={() => console.log("프리셋 버튼")}
                style={{ marginRight: 12 }}
              >
                <Typography weight="600" size={14} style={{ color: "green" }}>
                  프리셋
                </Typography>
              </Pressable>
              <Pressable onPress={() => console.log("마이페이지 이동")}>
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color="black"
                />
              </Pressable>
            </>
          ),
        }}
      />

      <Tabs.Screen
        name="alert-additional"
        options={{
          title: "알림 설정",
          tabBarLabel: ({ focused }) => (
            <Typography weight={focused ? "600" : "400"} size={12}>
              추가
            </Typography>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="plus.circle.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chart"
        options={{
          title: "증권",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alert-history"
        options={{
          title: "기록",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
