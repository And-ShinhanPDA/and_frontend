import { Typography } from "@/components/ui/Typography";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, TouchableOpacity } from "react-native";

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

// 전역 플래그로 중복 호출 완전 방지
let globalFetchInProgress = false;
let globalHasFetched = false;
let lastAccessToken = "";
let cachedAlerts: ToastAlert[] = []; // 전역 캐시

export default function PriceAlertToast() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [index, setIndex] = useState(0);
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // 토스트 클릭 시 알림 히스토리로 이동
  const handleToastPress = () => {
    if (alerts.length > 0) {
      const currentAlert = alerts[index];
      console.log(
        `[토스트 클릭] ID: ${currentAlert.id}, 기업: ${currentAlert.name}로 히스토리 이동`
      );

      // 알림 히스토리 탭으로 이동 (히스토리 고유 ID 전달)
      router.push({
        pathname: "/(tabs)/(alert-history)",
        params: {
          highlightHistoryId: currentAlert.id.toString(),
          highlightCompany: currentAlert.name,
        },
      });
    }
  };

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 오늘의 알림 데이터 가져오기
  const fetchTodayAlerts = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    // accessToken이 변경되면 플래그 및 캐시 리셋 (로그인/로그아웃 시)
    if (lastAccessToken !== accessToken) {
      globalHasFetched = false;
      globalFetchInProgress = false;
      cachedAlerts = [];
      lastAccessToken = accessToken;
    }

    // 캐시된 데이터가 있으면 바로 사용
    if (cachedAlerts.length > 0) {
      setAlerts(cachedAlerts);
      setLoading(false);
      return;
    }

    // 전역 플래그로 중복 호출 완전 차단
    if (globalHasFetched || globalFetchInProgress) {
      setLoading(false);
      return;
    }

    globalFetchInProgress = true; // API 호출 중 표시

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

        cachedAlerts = toastAlerts; // 전역 캐시에 저장
        setAlerts(toastAlerts);
        console.log(`[토스트] 오늘의 알림 ${toastAlerts.length}개 로드됨`);
        globalHasFetched = true; // 성공 시 완료 표시
      } else {
        // 기본 알림 데이터 (데이터가 없을 때)
        const defaultAlert = [
          {
            id: 1,
            name: "삼성전자",
            message: "오늘 알림이 없습니다",
            logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
          },
        ];
        cachedAlerts = defaultAlert;
        setAlerts(defaultAlert);
        globalHasFetched = true;
      }
    } catch (error) {
      console.error("[토스트] 오늘의 알림 조회 실패:", error);
      // 에러 시 기본 알림 표시
      const errorAlert = [
        {
          id: 1,
          name: "알림",
          message: "알림을 불러올 수 없습니다",
          logo: require("@/assets/images/companies/logo_1_삼성전자.png"),
        },
      ];
      cachedAlerts = errorAlert;
      setAlerts(errorAlert);
      globalHasFetched = true;
    } finally {
      globalFetchInProgress = false; // 호출 완료
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAlerts();
  }, [accessToken]);

  // 로그 출력을 위한 ref
  const lastLoggedAlert = useRef<string>("");

  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      setIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % alerts.length;

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
          ]).start(() => {
            // 애니메이션 완료 후 로그 출력 (중복 방지)
            const currentAlert = alerts[nextIndex];
            const alertKey = `${currentAlert.id}-${currentAlert.name}`;

            if (lastLoggedAlert.current !== alertKey) {
              // console.log(
              //   `[토스트 표시] ID: ${currentAlert.id}, 기업: ${currentAlert.name}, 메시지: ${currentAlert.message}`
              // );
              lastLoggedAlert.current = alertKey;
            }
          });
        });

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [alerts]); // index 제거

  if (loading || alerts.length === 0) {
    return null;
  }

  const current = alerts[index];

  return (
    <TouchableOpacity onPress={handleToastPress} activeOpacity={0.7}>
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
        <Typography
          weight="500"
          size={15}
          style={styles.text}
          numberOfLines={1}
        >
          {current.message}
        </Typography>
      </Animated.View>
    </TouchableOpacity>
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
