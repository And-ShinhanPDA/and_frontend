import { saveActivatedCompanies } from "@/services/widgetShare";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    ImageSourcePropType,
    Pressable,
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
  indicatorSnapshot?: string; // 위젯용 지표 데이터
  iconName?: string; // 위젯용 아이콘 이름
  stockCode?: string; // 위젯용 stockCode
  title?: string; // 위젯용 알림 제목
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
  const router = useRouter();

  // 실제 API로부터 데이터 불러오기
  const fetchTriggeredAlerts = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const res = await alertService.getTriggeredAlerts(accessToken);

      // 기업별 알림 데이터 그룹핑 (최신 것만)
      const grouped: Record<string, { count: number; alert: any }> = {};
      res.forEach((a: any) => {
        if (a.stockCode) {
          if (!grouped[a.stockCode]) {
            grouped[a.stockCode] = { count: 0, alert: a };
          }
          grouped[a.stockCode].count += 1;
        }
      });

      const formatted: CompanyAlert[] = Object.entries(grouped).map(
        ([stockCode, data]) => {
          const matched = COMPANIES.find((c) => c.code === stockCode);
          
          // conditions를 indicatorSnapshot으로 변환
          const indicators: Record<string, string> = {};
          if (data.alert.conditions && Array.isArray(data.alert.conditions)) {
            data.alert.conditions.forEach((cond: any, index: number) => {
              const indicatorName = cond.indicator || `조건${index + 1}`;
              const description = cond.description || indicatorName;
              indicators[indicatorName] = description;
            });
          }
          
          const indicatorSnapshot = Object.keys(indicators).length > 0 
            ? JSON.stringify(indicators) 
            : undefined;

          // iconName은 PNG 파일명 (예: "logo_1_삼성전자")
          let iconName: string | undefined = undefined;
          if (matched) {
            // logo_N_기업명 형식으로 파일명 생성
            iconName = `logo_${matched.id}_${matched.name}`;
          }

          return {
            id: Number(stockCode),
            name: matched?.name || stockCode,
            price: "-",
            count: data.count,
            logo:
              matched?.logo ||
              require("../../assets/images/companies/logo_1_삼성전자.png"),
            indicatorSnapshot,
            iconName, // 예: "logo_1_삼성전자"
            stockCode, // 위젯에서 이미지 찾는데 사용
            title: data.alert.title, // 위젯용 알림 제목
          };
        }
      );

      setCompanies(formatted);
      saveActivatedCompanies(formatted); // 위젯 공유용 저장
      console.log("[홈] 활성화된 기업:", formatted.length);
      console.log("📊 [기업 알림 상세]:", formatted);
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
          <View style={styles.emptyContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              현재 활성화된 기업 알림이 없습니다
            </Text>
          </View>
        ) : (
          companies.map((item, index) => {
            const isLast = index === companies.length - 1;
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(alert-company)/(alert-company-detail)/[id]",
                    params: { id: item.stockCode, name: item.name },
                  })
                }
              >
                <View style={[styles.row, isLast && styles.rowLast]}>
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
              </Pressable>
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
    minHeight: 120,
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Pretendard",
    textAlign: "center",
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
