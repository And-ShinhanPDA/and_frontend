// components/bottom-navigation/custom-bottom-tab.tsx
import { Typography } from "@/components/ui/Typography";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

type TabName = "조건 검색" | "기업 알림" | "홈" | "차트" | "기록";

interface CustomBottomTabProps {
  activeTab?: TabName;
}

export function CustomBottomTab({ activeTab }: CustomBottomTabProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: "조건 검색" as TabName,
      path: "/(tabs)/(alert-condition)",
      icon: require("@/assets/images/bottomNavigation/condition.png"),
    },
    {
      name: "기업 알림" as TabName,
      path: "/(tabs)/(alert-company)",
      icon: require("@/assets/images/bottomNavigation/company.png"),
    },
    {
      name: "홈" as TabName,
      path: "/",
      icon: require("@/assets/images/bottomNavigation/home.png"),
    },
    {
      name: "차트" as TabName,
      path: "/(tabs)/(chart)",
      icon: require("@/assets/images/bottomNavigation/chart.png"),
    },
    {
      name: "기록" as TabName,
      path: "/(tabs)/(alert-history)",
      icon: require("@/assets/images/bottomNavigation/history.png"),
    },
  ];

  const isActive = (tab: (typeof tabs)[0]) => {
    if (activeTab) {
      return tab.name === activeTab;
    }

    // 홈 특별 처리
    if (tab.name === "홈") {
      return (
        pathname === "/" ||
        pathname === "/(tabs)" ||
        pathname === "/(tabs)/index"
      );
    }

    return pathname.startsWith(tab.path);
  };

  const handleTabPress = (tab: (typeof tabs)[0]) => {
    // 홈은 무조건 이동
    if (tab.name === "홈") {
      router.replace({ pathname: "/(tabs)/index" as any });
      return;
    }

    // 현재 경로와 같으면 아무것도 안함
    if (pathname.startsWith(tab.path)) {
      return;
    }

    router.replace({ pathname: tab.path as any });
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const focused = isActive(tab);

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab)}
          >
            <Image
              source={tab.icon}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? "#4CC439" : "#484C52",
              }}
              resizeMode="contain"
            />
            <Typography
              weight={focused ? "600" : "400"}
              size={12}
              style={{ color: focused ? "#4CC439" : "#484C52" }}
            >
              {tab.name}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
