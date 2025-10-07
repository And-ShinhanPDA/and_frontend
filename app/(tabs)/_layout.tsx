import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Image, Pressable } from "react-native";

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
    return <Redirect href={"/login"}></Redirect>;
  }

  return (
    // 전역적으로 상단 스타일 먹이기
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarButton: HapticTab,
        headerTitleAlign: "left",

        headerStyle: {
          shadowOpacity: 0,
          elevation: 0,
          borderBottomWidth: 0,
        },

        headerTitle: ({ children }) => (
          <Typography weight="600" size={20}>
            {children}
          </Typography>
        ),

        headerTitleContainerStyle: {
          left: 0,
          paddingLeft: 10,
        },

        headerRightContainerStyle: {
          paddingRight: 20,
        },

        headerRight: () => (
          <Pressable onPress={() => console.log("마이페이지 이동")}>
            <Image
              source={require("@/assets/images/mypage.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
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
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(alert-manage)"
        options={{
          title: "기업 알림",
          tabBarLabel: ({ focused }) => (
            <Typography weight={focused ? "600" : "400"} size={12}>
              알림
            </Typography>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bell.fill" color={color} />
          ),

          headerRight: () => (
            <>
              <Pressable
                onPress={() => console.log("프리셋 버튼")}
                style={{
                  backgroundColor: "rgba(76, 197, 58, 0.15)",
                  borderRadius: 7,
                  width: 62,
                  height: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  marginRight: 11,
                }}
              >
                <Image
                  source={require("@/assets/images/preset.png")}
                  style={{ width: 12, height: 12, marginRight: 3 }}
                  resizeMode="contain"
                />
                <Typography weight="400" size={12} style={{ color: "#4CC53A" }}>
                  프리셋
                </Typography>
              </Pressable>
              <Pressable onPress={() => console.log("마이페이지 이동")}>
                <Image
                  source={require("@/assets/images/mypage.png")}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </Pressable>
            </>
          ),
        }}
      />

      <Tabs.Screen
        name="alert-additional/index"
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
        name="alert-additional/[companyId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="chart"
        options={{
          title: "자동매매",
          tabBarLabel: ({ focused }) => (
            <Typography weight={focused ? "600" : "400"} size={12}>
              차트
            </Typography>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alert-history"
        options={{
          title: "알림 히스토리",
          tabBarLabel: ({ focused }) => (
            <Typography weight={focused ? "600" : "400"} size={12}>
              기록
            </Typography>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
