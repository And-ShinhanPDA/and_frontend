import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { saveActivatedConditions } from "@/services/widgetShare";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Condition = {
  id: number;
  name: string;
  count: number;
  indicatorSnapshot?: string; // 위젯용 지표 데이터
  iconName?: string; // 위젯용 아이콘 이름
};

// API 응답 타입
type TriggeredCondition = {
  conditionName: string;
  activeCompanyCount: number;
};

const sampleConditions: Condition[] = [
  { id: 1, name: "알림1", count: 3 },
  { id: 2, name: "알림2", count: 4 },
  { id: 3, name: "알림3", count: 1 },
];

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

  return (
    <Animated.View
      style={[
        styles.blinkingDot,
        {
          opacity: opacity,
        },
      ]}
    />
  );
};

export default function ActivatedConditionCard() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const { accessToken } = useAuth();
  const router = useRouter();

  // 실제 API로부터 조건 알림 데이터 불러오기
  const fetchTriggeredConditionAlerts = async () => {
    if (!accessToken) {
      return;
    }

    try {
      // stockCode가 null인 알림 = 조건 검색 알림
      const res = await alertService.getTriggeredAlerts(accessToken);

      // stockCode가 null인 알림만 필터링 (조건 알림)
      const conditionAlerts = res.filter((a: any) => a.stockCode === null);

      // 알림 ID별로 그룹핑
      const grouped: Record<string, { count: number; alert: any }> = {};
      conditionAlerts.forEach((a: any) => {
        const alertId = String(a.alertId) || "unknown";
        if (!grouped[alertId]) {
          grouped[alertId] = { count: 0, alert: a };
        }
        grouped[alertId].count += 1;
      });

      const formatted: Condition[] = Object.entries(grouped).map(
        ([alertId, data], index) => {
          // conditions를 indicatorSnapshot으로 변환
          const indicators: Record<string, string> = {};
          if (data.alert.conditions && Array.isArray(data.alert.conditions)) {
            data.alert.conditions.forEach((cond: any, idx: number) => {
              const indicatorName = cond.indicator || `조건${idx + 1}`;
              const description = cond.description || indicatorName;
              indicators[indicatorName] = description;
            });
          }

          const indicatorSnapshot =
            Object.keys(indicators).length > 0
              ? JSON.stringify(indicators)
              : undefined;

          return {
            id: Number(alertId) || index + 1,
            name: data.alert.title || data.alert.message || "조건 알림",
            count: data.count,
            indicatorSnapshot,
            iconName: undefined,
          };
        }
      );

      setConditions(formatted);
      saveActivatedConditions(formatted); // 위젯 공유용 저장
      console.log("[홈] 활성화된 조건 알림:", formatted.length);
      console.log("📊 [조건 알림 상세]:", formatted);
    } catch (err) {
      console.error("활성화된 조건 알림 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchTriggeredConditionAlerts();
  }, []);

  // 홈 화면 포커스 시마다 위젯 데이터 즉시 업데이트
  useFocusEffect(
    useCallback(() => {
      fetchTriggeredConditionAlerts();
    }, [accessToken])
  );

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>현재 충족 중인 조건 검색</Text>
        <BlinkingDot />
      </View>
      <View style={styles.card}>
        {conditions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              현재 충족 중인 조건 검색이 없습니다
            </Text>
          </View>
        ) : (
          conditions.map((item, index) => {
            const isLast = index === conditions.length - 1;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname:
                      "/(tabs)/(alert-condition)/(alert-condition-companyList)/[id]",
                    params: {
                      id: String(item.id),
                      name: item.name,
                      tags: "[]",
                    },
                  })
                }
              >
                <View style={[styles.row, isLast && styles.rowLast]}>
                  <View style={styles.left}>
                    <View style={styles.dot} />
                    <Text style={styles.name}>{item.name}</Text>
                  </View>
                  <Text style={styles.count}>{item.count}개 활성화</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

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
    paddingVertical: 10,
  },
  emptyIcon: {
    width: 80,
    height: 80,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Pretendard",
    textAlign: "center",
    paddingVertical: 20,
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
    marginBottom: 24,
  },
  rowLast: {
    marginBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#21C55D",
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    color: "#111",
    fontFamily: "Pretendard",
  },
  count: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Pretendard",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontFamily: "Pretendard",
    paddingVertical: 20,
  },
});
