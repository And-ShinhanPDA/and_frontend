import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { refreshWidgetManually } from "@/services/widgetShare";
import { getIndicatorCategoriesArray } from "@/utils/parseConditions";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
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

export default function CompanyAlertDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { accessToken, signOut, user } = useAuth();

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

  // console.log("id : stockId:", id);
  // console.log("name:", name);
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80);

  // 고정 "시가/종가 알림" 스위치 상태
  const [priceOpenCloseEnabled, setPriceOpenCloseEnabled] =
    useState<boolean>(false);

  // 프리셋 모달 상태
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false); // 활성화된 알림만 보기

  // TODO: API 연결
  const [alerts, setAlerts] = useState<AlertCondition[]>([]);

  // 기업별 알림 조회 함수
  const fetchCompanyAlerts = useCallback(async () => {
    if (!accessToken || !id) return;
    try {
      console.log("[API 호출 시작] /api/alerts?stockCode=", id);

      // 1. 해당 기업의 전체 알림 조회
      const res = await alertService.getUserAlerts(accessToken, {
        stockCode: id,
      });

      // 2. Triggered 알림 조회 (조건 만족한 알림들)
      const triggeredRes = await alertService.getTriggeredAlerts(accessToken, [
        id,
      ]);
      const triggeredAlertIds = new Set(
        triggeredRes.map((a: any) => String(a.alertId))
      );

      console.log("[알림 응답]:", res);

      if (res?.data && Array.isArray(res.data)) {
        // TODO: 실제 구조에 맞게 변환 필요
        const formatted = res.data.map((a: any) => {
          const alertId = String(a.alertId ?? a.id ?? "0");
          return {
            id: alertId,
            name: a.title ?? "알림 이름 없음",
            enabled: a.isActive ?? true,
            tags: a.conditions
              ? getIndicatorCategoriesArray(a.conditions)
              : ["조건"],
            isTriggered: triggeredAlertIds.has(alertId), // 조건 만족 여부
          };
        });
        setAlerts(formatted);
        console.log(`변환된 알림 수: ${formatted.length}`);
        console.log(`Triggered 알림 수: ${triggeredAlertIds.size}`);

        // 시가/종가 상태 조회 (첫 번째 알림이 있을 때)
        if (formatted.length > 0) {
          try {
            const priceStatus = await alertService.getPriceOnOffStatus(
              accessToken,
              parseInt(formatted[0].id)
            );
            setPriceOpenCloseEnabled(priceStatus);
          } catch (err) {
            console.error("[시가/종가 상태 조회 실패]:", err);
          }
        }
      }
    } catch (err) {
      console.error("[기업별 알림 조회 실패]:", err);
    }
  }, [accessToken, id]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchCompanyAlerts();
    }, [fetchCompanyAlerts])
  );

  // 초기 애니메이션 설정
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    alerts.forEach((alert) => {
      anims[alert.id] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, [alerts]);

  // 시가/종가 토글 핸들러
  const togglePriceOpenClose = async () => {
    if (!accessToken || alerts.length === 0) return;
    try {
      const newState = !priceOpenCloseEnabled;
      const firstAlert = alerts[0];

      // UI 상태 먼저 업데이트
      setPriceOpenCloseEnabled(newState);

      // 시가/종가 전용 PATCH API 호출
      await alertService.updatePriceOnOffStatus(
        accessToken,
        parseInt(firstAlert.id),
        newState
      );

      console.log(`[시가/종가 토글] ${newState ? "켜짐" : "꺼짐"}`);
    } catch (err) {
      console.error("[시가/종가 토글 실패]:", err);
      // 실패 시 원래 상태로 되돌리기
      setPriceOpenCloseEnabled(!priceOpenCloseEnabled);
    }
  };

  // 토글 스위치
  const toggleSwitch = async (id: string, isActive: boolean) => {
    if (!accessToken) return;
    try {
      const newState = !isActive;

      setAlerts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, enabled: newState } : c))
      );
      const res = await alertService.toggleAlertActive(
        accessToken,
        id,
        newState
      );

      console.log(`${name} 알림 ${newState ? "활성화" : "비활성화"} 성공`, res);
      
      // 위젯 즉시 새로고침
      refreshWidgetManually();
    } catch (err) {
      console.error("[알림 토글 실패]:", err);
    }
  };

  // 삭제 기능
  const deleteAlert = async (alertId: string) => {
    if (!accessToken) return;
    try {
      const res = await alertService.deleteAlert(accessToken, alertId);
      console.log("[알림 삭제 성공]:", res);

      setAlerts((prev) => prev.filter((c) => c.id !== alertId));
      
      // 위젯 즉시 새로고침
      refreshWidgetManually();
    } catch (err) {
      console.error("[알림 삭제 실패]:", err);
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

  // 검색 필터
  const filteredAlerts = alerts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // 고정 시가/종가 알림 행 (스와이프/삭제 불가)
  const FixedPriceRow = () => (
    <>
      <View style={{ height: 20 }} />
      <View style={[styles.itemRow]}>
        <View style={styles.itemText}>
          <Text style={styles.name}>시가/종가 알림</Text>
        </View>

        <Switch
          trackColor={{ false: "#ccc", true: "#4CC439" }}
          thumbColor="#fff"
          ios_backgroundColor="#E9E9EA"
          onValueChange={togglePriceOpenClose}
          value={priceOpenCloseEnabled}
        />
      </View>

      <View style={styles.fixedDivider} />
    </>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <CustomHeader
        title={name ?? "기업 이름"}
        showBackButton={true}
        rightButtons="preset-and-mypage"
        onPresetPress={() => setIsPresetOpen(true)}
        userName={user?.name || "사용자"}
        onLogoutConfirm={handleLogout}
      />

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
            {showOnlyActive ? "전체 보기" : "활성화된 알림만 보기"}
          </Text>
        </TouchableOpacity>
      </View>

      <SwipeListView
        data={filteredAlerts.filter((c) =>
          showOnlyActive ? c.enabled && c.isTriggered : true
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onRowOpen={handleRowOpen}
        onRowClose={handleRowClose}
        rightOpenValue={-deleteWidth}
        disableRightSwipe
        closeOnRowPress
        ListHeaderComponent={<FixedPriceRow />}
        renderItem={({ item, index }) => {
          const fadeAnim = fadeAnimations[item.id] || new Animated.Value(1);
          const isLast = index === filteredAlerts.length - 1;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    "/(tabs)/(alert-company)/(alert-company-alertDetail)/[id]",
                  params: { id: item.id },
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
                    {item.tags.map((tag, i) => (
                      <View key={i} style={styles.tag}>
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
                    onValueChange={() => toggleSwitch(item.id, item.enabled)}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(alert-company)/(alert-company-additional)/[id]",
            params: { id: id, name: name },
          })
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

      <CustomBottomTab activeTab="기업 알림" />
    </View>
  );
}

const styles = StyleSheet.create({
  /* 화면 */
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* 필터 버튼 */
  filterButtonContainer: {
    paddingHorizontal: 22,
    marginTop: 12,
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

  /* 리스트 아이템 */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: "#F5F6F8",
    backgroundColor: "#fff",
    paddingHorizontal: 28,
  },
  itemText: { flex: 1 },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Pretendard" },

  /* 태그 */
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  tag: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: { fontSize: 11, fontFamily: "Pretendard" },

  /* 스와이프 숨김 영역(삭제) */
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

  /* FAB */
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
  plusIcon: { width: 35, height: 35, resizeMode: "contain" },

  fixedDivider: {
    height: 8, // 구분용 공간
    backgroundColor: "#F5F6F8",
    width: "100%",
  },
});
