import { saveActivatedConditions } from "@/services/widgetShare";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Condition = {
  id: number;
  name: string;
  count: number;
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

export default function ActivatedConditionCard({
  data = sampleConditions,
  triggeredConditions,
  loading = false,
}: {
  data?: Condition[];
  triggeredConditions?: TriggeredCondition[];
  loading?: boolean;
}) {
  // API 데이터를 UI용 데이터로 변환
  const displayData = triggeredConditions
    ? triggeredConditions.map((item, index) => ({
        id: index + 1,
        name: item.conditionName,
        count: item.activeCompanyCount,
      }))
    : data;

  // 위젯으로 데이터 전달
  useEffect(() => {
    saveActivatedConditions(displayData);
  }, [displayData]);

  return (
    <View>
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>활성화 된 조건 알림</Text>
        <BlinkingDot />
      </View>
      <View style={styles.card}>
        {loading ? (
          <Text style={styles.loadingText}>
            활성화된 조건 알림을 불러오는 중...
          </Text>
        ) : displayData.length === 0 ? (
          <Text style={styles.emptyText}>
            현재 활성화된 조건 알림이 없습니다.
          </Text>
        ) : (
          displayData.map((item, index) => {
            const isLast = index === displayData.length - 1;

            return (
              <View
                style={[styles.row, isLast && styles.rowLast]}
                key={item.id}
              >
                <View style={styles.left}>
                  <View style={styles.dot} />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Text style={styles.count}>{item.count}개 활성화</Text>
              </View>
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
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontFamily: "Pretendard",
    paddingVertical: 20,
  },
});
