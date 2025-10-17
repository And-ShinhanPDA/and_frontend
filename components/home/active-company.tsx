import { saveActivatedCompanies } from "@/services/widgetShare";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COMPANIES } from "@/constants/companies";
import { alertService } from "@/services/alert-service";
import { useAuth } from "@/contexts/AuthContext";
type CompanyAlert = {
  id: number;
  name: string;
  price: string;
  count: number;
  logo: ImageSourcePropType;
};

// 깜빡이는 점 컴포넌트
const BlinkingDot = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.blinkingDot, { opacity }]} />;
};

export default function ActivatedCompanyCard() {
  const [companies, setCompanies] = useState<CompanyAlert[]>([]);
  const { accessToken } = useAuth();

  // 실제 API로부터 데이터 불러오기
  const fetchTriggeredAlerts = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const res = await alertService.getTriggeredAlerts(accessToken);

      // 기업별 알림 개수 카운트
      const grouped: Record<string, number> = {};
      res.forEach((a: any) => {
        grouped[a.stockCode] = (grouped[a.stockCode] || 0) + 1;
      });

      const formatted: CompanyAlert[] = Object.entries(grouped).map(
        ([stockCode, count]) => {
          const matched = COMPANIES.find((c) => c.code === stockCode);
          return {
            id: Number(stockCode),
            name: matched?.name || stockCode,
            price: "-", // 나중에 실제 현재값으로 교체필요
            count: count as number,
            logo:
              matched?.logo ||
              require("../../assets/images/companies/logo_1_삼성전자.png"),
          };
        }
      );

      setCompanies(formatted);
      saveActivatedCompanies(formatted); // 위젯 공유용 저장
      console.log("[홈] 활성화된 기업:", formatted.length);
    } catch (err) {
      console.error("활성화된 기업 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchTriggeredAlerts();
  }, []);
  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>활성화 된 기업 알림</Text>
        <BlinkingDot />
      </View>

      <View style={styles.card}>
        {companies.length === 0 ? (
          <Text style={{ color: "#666" }}>
            현재 활성화된 기업 알림이 없습니다.
          </Text>
        ) : (
          companies.map((item, index) => {
            const isLast = index === companies.length - 1;
            return (
              <View
                key={item.id}
                style={[styles.row, isLast && styles.rowLast]}
              >
                <View style={styles.left}>
                  <Image
                    source={item.logo}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>{item.price}</Text>
                  </View>
                </View>
                <Text style={styles.count}>{item.count}개</Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const LOGO_SIZE = 35;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    paddingBottom: 12,
    elevation: 3,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    fontFamily: "Pretendard",
    marginRight: 8,
  },
  blinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  rowLast: {
    marginBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginRight: 8,
    borderRadius: 9,
  },
  name: {
    fontSize: 14,
    color: "#111",
    fontFamily: "Pretendard",
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Pretendard",
  },
  count: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Pretendard",
  },
});
