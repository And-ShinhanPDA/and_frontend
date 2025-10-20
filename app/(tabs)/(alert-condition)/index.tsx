import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { refreshWidgetManually } from "@/services/widgetShare";
import { getIndicatorCategoriesArray } from "@/utils/parseConditions";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";

// TODO: types로 빼기
type AlertCondition = {
  id: string;
  name: string;
  enabled: boolean;
  tags: string[];
  isTriggered?: boolean; // 조건 만족하여 활성화된 상태
};

// 깜빡이는 점 컴포넌트
const BlinkingDot = () => {
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#EF4444",
        opacity: opacity,
        marginRight: 6,
      }}
    />
  );
};

export default function AlertCondition() {
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false); // 활성화된 알림만 보기
  const { signOut, user, accessToken } = useAuth();

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      console.log("로그아웃 성공");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  const [alerts, setAlerts] = useState<AlertCondition[]>([]);

  // 조건 검색 알림 조회
  const fetchConditionAlerts = async () => {
    if (!accessToken) {
      console.log("accessToken 없음");
      return;
    }
    try {
      console.log("🔄 [조건 알림 목록] 데이터 조회 시작");

      // 1. 전체 조건 알림 조회
      const res = await alertService.getUserAlerts(accessToken);

      // 2. Triggered 알림 조회 (조건 만족한 알림들)
      const triggeredRes = await alertService.getTriggeredAlerts(accessToken);
      const triggeredAlertIds = new Set(
        triggeredRes
          .filter((a: any) => !a.stockCode)
          .map((a: any) => String(a.alertId))
      );

      const rawList = Array.isArray(res?.data) ? res.data : [];

      if (Array.isArray(rawList)) {
        console.log("✅ [조건 알림 목록] 전체 알림 수:", rawList.length);

        const conditionAlerts = rawList.filter(
          (alert: any) =>
            alert.stockCode === null || alert.stockCode === undefined
        );

        const formatted: AlertCondition[] = conditionAlerts.map(
          (alert: any) => {
            // 조건에서 태그 추출 - getIndicatorCategoriesArray 사용
            const tags = alert.conditions
              ? getIndicatorCategoriesArray(alert.conditions)
              : [];

            const alertId = String(alert.id || alert.alertId);

            return {
              id: alertId,
              name: alert.title || "조건 알림",
              enabled: alert.isActive || false,
              tags: tags, // 중복 제거는 getIndicatorCategoriesArray에서 처리됨
              isTriggered: triggeredAlertIds.has(alertId), // 조건 만족 여부
            };
          }
        );

        setAlerts(formatted);
        console.log(`Triggered 조건 알림 수: ${triggeredAlertIds.size}`);
      }
    } catch (err) {
      console.error("[조건 검색 알림 조회 실패]:", err);
    }
  };

  // 활성화된 조건 알림 데이터 새로고침 및 위젯 업데이트
  const fetchTriggeredConditions = useCallback(async () => {
    if (!accessToken) return;

    try {
      console.log("🔄 [조건 검색] 활성화된 알림 데이터 새로고침 시작...");
      
      // 조건 알림 데이터 새로고침
      await fetchConditionAlerts();
      
      // 위젯 강제 새로고침
      refreshWidgetManually();
      
      console.log("✅ [조건 검색] 모든 데이터 + 위젯 새로고침 완료");
    } catch (err) {
      console.error("❌ [조건 검색] 데이터 새로고침 실패:", err);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      console.log(
        "🎯 [useFocusEffect] 조건 알림 목록 화면 포커스 - 데이터 새로고침"
      );
      fetchTriggeredConditions();
    }, [fetchTriggeredConditions])
  );

  // 초기 애니메이션 설정
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    alerts.forEach((alert) => {
      anims[alert.id] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, [alerts]);

  // 토글 스위치
  const toggleSwitch = async (id: string) => {
    if (!accessToken) return;
    const target = alerts.find((c) => c.id === id);
    if (!target) return;

    const newActive = !target.enabled;
    try {
      setAlerts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: newActive } : c))
      );

      await alertService.toggleAlertActive(accessToken, id, newActive);

      // API 호출 후 최신 데이터 다시 조회
      await fetchConditionAlerts();

      // 위젯 즉시 새로고침
      refreshWidgetManually();

      console.log(
        `${target.name} 조건 알림 ${newActive ? "활성화" : "비활성화"} 완료`
      );
    } catch (err) {
      console.error("[조건 알림 토글 실패]:", err);

      setAlerts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: !newActive } : c))
      );
    }
  };

  // 삭제 기능
  const deleteAlert = async (id: string) => {
    if (!accessToken) return;
    const target = alerts.find((c) => c.id === id);
    if (!target) return;

    try {
      await alertService.deleteAlert(accessToken, id);
      setAlerts((prev) => prev.filter((c) => c.id !== id));

      // 위젯 즉시 새로고침
      refreshWidgetManually();

      console.log(`${target.name} 조건 알림 삭제 완료`);
    } catch (err) {
      console.error("[조건 알림 삭제 실패]:", err);
    }
  };

  // 왼쪽 스와이프 시 fade out
  const handleRowOpen = (rowKey: string) => {
    const fadeAnim = fadeAnimations[rowKey];
    if (!fadeAnim) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 다시 닫을 시 fade in
  const handleRowClose = (rowKey: string) => {
    const fadeAnim = fadeAnimations[rowKey];
    if (!fadeAnim) return;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="조건 검색"
        showBackButton={false}
        rightButtons="preset-and-mypage"
        onPresetPress={() => setIsPresetOpen(true)}
        userName={user?.name || "사용자"}
        onLogoutConfirm={handleLogout}
      />

      <View style={styles.searchWrapper}>
        <Image
          source={require("@/assets/images/alert/search.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="조건을 검색해보세요"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 활성화된 알림만 보기 버튼 */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showOnlyActive && styles.filterButtonActive,
          ]}
          onPress={() => setShowOnlyActive(!showOnlyActive)}
        >
          <Text
            style={[
              styles.filterButtonText,
              showOnlyActive && styles.filterButtonTextActive,
            ]}
          >
            {showOnlyActive ? "전체 보기" : "활성화된 조건만 보기"}
          </Text>
        </TouchableOpacity>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>조건 검색을 추가해보세요!</Text>
        </View>
      ) : (
        <SwipeListView
          data={alerts
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .filter((c) =>
              showOnlyActive ? c.enabled && c.isTriggered : true
            )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onRowOpen={handleRowOpen}
          onRowClose={handleRowClose}
          rightOpenValue={-deleteWidth}
          disableRightSwipe
          closeOnRowPress
          renderItem={({ item, index }) => {
            const fadeAnim = fadeAnimations[item.id] || new Animated.Value(1);
            const filtered = alerts.filter((c) =>
              c.name.toLowerCase().includes(search.toLowerCase())
            );
            const isLast = index === filtered.length - 1;

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname:
                      "/(tabs)/(alert-condition)/(alert-condition-companyList)/[id]",
                    params: {
                      id: item.id,
                      name: item.name,
                      tags: JSON.stringify(item.tags),
                    },
                  })
                }
              >
                <View
                  style={[
                    styles.itemRow,
                    isLast && { borderBottomWidth: 1, borderColor: "#F5F6F8" },
                  ]}
                >
                  <View style={styles.itemText}>
                    <View style={styles.nameContainer}>
                      {item.enabled && item.isTriggered && <BlinkingDot />}
                      <Text style={styles.name}>{item.name}</Text>
                    </View>

                    <View style={styles.tagContainer}>
                      {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          scale: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    }}
                  >
                    <Switch
                      trackColor={{ false: "#ccc", true: "#4CC439" }}
                      thumbColor="#fff"
                      ios_backgroundColor="#E9E9EA"
                      onValueChange={() => toggleSwitch(item.id)}
                      value={item.enabled}
                    />
                  </Animated.View>
                </View>
              </Pressable>
            );
          }}
          renderHiddenItem={({ item }) => (
            <View style={styles.hiddenContainer}>
              <TouchableOpacity
                style={styles.deleteButton}
                onLayout={(e) => setDeleteWidth(e.nativeEvent.layout.width)}
                onPress={() => deleteAlert(item.id)}
              >
                <Text style={styles.deleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push(
            "/(tabs)/(alert-condition)/(alert-condition-additional)/[id]"
          )
        }
      >
        <Image
          source={require("@/assets/images/alert/condition_alert.png")}
          style={styles.plusIcon}
        />
      </TouchableOpacity>

      {/* 프리셋 모달 */}
      <ConditionBottomSheet
        visible={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        ratio={0.8}
      >
        <PresetSelect onClose={() => setIsPresetOpen(false)} />
      </ConditionBottomSheet>

      <CustomBottomTab activeTab="조건 검색" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 40,
    margin: 22,
  },
  filterButtonContainer: {
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4CC439",
    borderColor: "#4CC439",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Pretendard",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  searchBar: { flex: 1, marginLeft: 6 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#F5F6F8",
    backgroundColor: "#fff",
    paddingHorizontal: 28,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Pretendard" },
  hiddenContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    width: 80,
    height: "100%",
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "Pretendard",
  },
  fab: {
    position: "absolute",
    right: 30,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CC439B3",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  plusIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  searchIcon: {
    width: 15,
    height: 15,
    resizeMode: "contain",
    marginBottom: 2,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Pretendard",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    fontFamily: "Pretendard",
    textAlign: "center",
  },
});
