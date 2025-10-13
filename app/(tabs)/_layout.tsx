import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Image, Pressable } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import PriceAlertToast from "@/components/home/price-toast-alert";
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
          <Typography
            weight={focused ? "600" : "400"}
            size={12}
            style={{ color: focused ? "#4CC439" : "#484C52" }}
          >
            {children}
          </Typography>
        ),
      }}
    >
      <Tabs.Screen
        name="(alert-condition)"
        options={{
          title: "조건 검색",
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
        name="condition-additional/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="(alert-manage)"
        options={{
          title: "기업 알림",
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
        name="index"
        options={{
          title: "홈",
          header: () => <PriceAlertToast />,
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
        name="alert-additional/index"
        options={{
          title: "알림 설정",
          href: null,
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
        name="chart/index"
        options={{
          title: "차트",
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
        name="chart/[chartId]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="alert-history"
        options={{
          title: "알림 히스토리",
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
