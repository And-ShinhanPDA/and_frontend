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
      // 조건별 활성화된 기업 수 조회 (이 API가 메인)
      const conditionData: TriggeredCondition[] =
        await alertService.getTriggeredConditionAlerts(accessToken);
      console.log("🔥 [홈-조건] getTriggeredConditionAlerts 응답:", conditionData);

      // 전체 조건 알림 조회 (알림 ID 매핑용)
      const allAlertsRes = await alertService.getUserAlerts(accessToken);
      const allConditionAlerts = Array.isArray(allAlertsRes?.data)
        ? allAlertsRes.data.filter(
            (a: any) => a.stockCode === null || a.stockCode === undefined
          )
        : [];
      console.log("🔥 [홈-조건] 전체 조건 알림:", allConditionAlerts);

      // 조건명으로 알림 ID 및 conditions 매핑
      const nameToAlertMap = new Map(
        allConditionAlerts.map((a: any) => [
          a.title,
          { id: String(a.id || a.alertId), conditions: a.conditions }
        ])
      );
      console.log("🔥 [홈-조건] 조건명→Alert 매핑:", Array.from(nameToAlertMap.entries()));

      // API 응답을 Condition 타입으로 변환 (활성화 1개 이상만)
      const formatted: Condition[] = conditionData
        .filter((item) => item.activeCompanyCount > 0)
        .map((item, index) => {
          const alertData = nameToAlertMap.get(item.conditionName);
          const alertId = alertData?.id || String(index + 1);
          
          // indicatorSnapshot 생성 (위젯에서 사용)
          let indicatorSnapshot: string | undefined = undefined;
          if (alertData?.conditions && Array.isArray(alertData.conditions)) {
            const indicators: Record<string, string> = {};
            alertData.conditions.forEach((cond: any) => {
              const indicatorName = cond.indicator || "";
              const description = cond.description || String(cond.threshold || "");
              if (indicatorName) {
                indicators[indicatorName] = description;
              }
            });
            if (Object.keys(indicators).length > 0) {
              indicatorSnapshot = JSON.stringify(indicators);
            }
          }
          
          console.log(`🔥 [홈-조건] ${item.conditionName} → alertId=${alertId}, count=${item.activeCompanyCount}, indicators=${indicatorSnapshot}`);
          
          return {
            id: Number(alertId),
            name: item.conditionName,
            count: item.activeCompanyCount,
            indicatorSnapshot: indicatorSnapshot,
            iconName: undefined,
          };
        });

      setConditions(formatted);
      saveActivatedConditions(formatted); // 위젯 공유용 저장
      console.log("✅ [홈-조건] 활성화된 조건 알림:", formatted.length);
      console.log("📊 [홈-조건] 상세 데이터:", formatted);
    } catch (err) {
      console.error("❌ [홈-조건] 활성화된 조건 알림 조회 실패:", err);
      setConditions([]);
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
                onPress={() => {
                  console.log("🔥 [홈-조건] 조건 클릭:", {
                    id: item.id,
                    name: item.name,
                    count: item.count,
                  });
                  router.push({
                    pathname:
                      "/(tabs)/(alert-condition)/(alert-condition-companyList)/[id]",
                    params: {
                      id: String(item.id),
                      name: item.name,
                      tags: "[]",
                    },
                  });
                }}
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
