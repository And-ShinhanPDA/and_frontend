import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isReady, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href={"/login"}></Redirect>;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CC439",
        tabBarInactiveTintColor: "#484C52",
        tabBarButton: HapticTab,
        headerTitleAlign: "left",

        tabBarLabel: ({ focused, children }) => (
          <Typography
            weight={focused ? "600" : "400"}
            size={12}
            style={{ color: focused ? "#4CC439" : "#484C52" }}
          >
            {children}
          </Typography>
        ),

        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 12,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#E5E5E5",
          backgroundColor: "#fff",
        },
      }}
    >
      <Tabs.Screen
        name="(alert-condition)"
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Typography
              weight={focused ? "600" : "400"}
              size={12}
              style={{ color: focused ? "#4CC439" : "#484C52" }}
            >
              조건 검색
            </Typography>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/bottomNavigation/condition.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CC439" : "#484C52",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(alert-condition-detail)/[id]"
        options={{
          href: null,
          tabBarStyle: { display: "none" }, // 바텀 네비게이션 숨김
          headerShown: false, // 헤더 숨김
        }}
      />

      <Tabs.Screen
        name="(alert-condition-modify)/[id]"
        options={{
          href: null,
          tabBarStyle: { display: "none" }, // 바텀 네비게이션 숨김
          headerShown: false, // 헤더 숨김
        }}
      />

      <Tabs.Screen
        name="(alert-condition-companyList)/[id]"
        options={{
          href: null,
          headerShown: false, // 헤더 숨김
        }}
      />

      <Tabs.Screen
        name="(alert-company)"
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Typography
              weight={focused ? "600" : "400"}
              size={12}
              style={{ color: focused ? "#4CC439" : "#484C52" }}
            >
              기업 알림
            </Typography>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/bottomNavigation/company.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CC439" : "#484C52",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(alert-company-additional)/[id]"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="(alert-company-detail)/[id]"
        options={{
          headerShown: false,
          href: null,
        }}
      />

      <Tabs.Screen
        name="(alert-condition-additional)/[id]"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="(alert-company-alertDetail)/[id]"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="(alert-company-alertModify)/[id]"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Typography
              weight={focused ? "600" : "400"}
              size={12}
              style={{ color: focused ? "#4CC439" : "#484C52" }}
            >
              홈
            </Typography>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/bottomNavigation/home.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CC439" : "#484C52",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(chart)/index"
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Typography
              weight={focused ? "600" : "400"}
              size={12}
              style={{ color: focused ? "#4CC439" : "#484C52" }}
            >
              차트
            </Typography>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/bottomNavigation/chart.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CC439" : "#484C52",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(chart)/[chartId]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="(alert-history)/index"
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Typography
              weight={focused ? "600" : "400"}
              size={12}
              style={{ color: focused ? "#4CC439" : "#484C52" }}
            >
              기록
            </Typography>
          ),
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/bottomNavigation/history.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CC439" : "#484C52",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
