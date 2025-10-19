import { Typography } from "@/components/ui/Typography";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";

type TodayAlert = {
  id: number;
  alertId: number;
  stockCode: string;
  isSent: boolean;
  indicatorSnapshot: string;
  createdAt: string;
};

type ToastAlert = {
  id: number;
  name: string;
  message: string;
  logo: any;
};

const getCompanyInfo = (stockCode: string) => {
  const company = COMPANIES.find((comp) => comp.code === stockCode);
  return {
    name: company?.name || "알 수 없는 기업",
    logo:
      company?.logo || require("@/assets/images/companies/logo_1_삼성전자.png"),
  };
};

export default function PriceAlertToast() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [index, setIndex] = useState(0);
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 오늘의 알림 데이터 가져오기
  const fetchTodayAlerts = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const todayAlerts = await alertService.getTodayAlerts(accessToken);

      if (Array.isArray(todayAlerts) && todayAlerts.length > 0) {
        const toastAlerts: ToastAlert[] = todayAlerts.map(
          (alert: TodayAlert) => {
            const companyInfo = getCompanyInfo(alert.stockCode);
            return {
              id: alert.id,
              name: companyInfo.name,
              message: alert.indicatorSnapshot || "알림 조건 충족!",
              logo: companyInfo.logo,
            };
          }
        );

        setAlerts(toastAlerts);
        console.log(`[토스트] 오늘의 알림 ${toastAlerts.length}개 로드됨`);
      } else {
        // 기본 알림 데이터 (데이터가 없을 때)
        setAlerts([
          {
            id: 1,
            name: "삼성전자",
            message: "오늘 알림이 없습니다",
            logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
          },
        ]);
      }
    } catch (error) {
      console.error("[토스트] 오늘의 알림 조회 실패:", error);
      // 에러 시 기본 알림 표시
      setAlerts([
        {
          id: 1,
          name: "알림",
          message: "알림을 불러올 수 없습니다",
          logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAlerts();
  }, [accessToken]);

  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const nextIndex = (index + 1) % alerts.length;
        setIndex(nextIndex);

        // 토스트 전환 시 현재 표시되는 알림 정보 콘솔
        const currentAlert = alerts[nextIndex];
        console.log(
          `[토스트 전환] ID: ${currentAlert.id}, 기업: ${currentAlert.name}, 메시지: ${currentAlert.message}`
        );

        translateY.setValue(10);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [alerts, index]);

  if (loading || alerts.length === 0) {
    return null;
  }

  const current = alerts[index];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Image
        source={current.logo}
        style={{ width: 24, height: 24, borderRadius: 6 }}
        resizeMode="contain"
      />
      <Typography weight="500" size={15} style={styles.text} numberOfLines={1}>
        {current.message}
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 250,
    marginLeft: 10,
  },
  text: {
    color: "#333",
  },
});
