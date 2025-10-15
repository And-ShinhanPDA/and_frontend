import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { getIndicatorCategoriesArray } from "@/utils/parseConditions";

// TODO: types로 빼기
type AlertCondition = {
  id: string;
  name: string;
  enabled: boolean;
  tags: string[];
};

export default function CompanyAlertDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { accessToken } = useAuth();

  // console.log("id : stockId:", id);
  // console.log("name:", name);
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80);

  // 고정 "시가/종가 알림" 스위치 상태
  const [priceOpenCloseEnabled, setPriceOpenCloseEnabled] =
    useState<boolean>(true);

  // 프리셋 모달 상태
  const [isPresetOpen, setIsPresetOpen] = useState(false);

  // TODO: API 연결
  const [alerts, setAlerts] = useState<AlertCondition[]>([]);

  useEffect(() => {
    const fetchCompanyAlerts = async () => {
      if (!accessToken || !id) return;
      try {
        console.log("[API 호출 시작] /api/alerts?stockCode=", id);

        const res = await alertService.getUserAlerts(accessToken, {
          stockCode: id,
        });

        console.log("[알림 응답]:", res);

        if (res?.data && Array.isArray(res.data)) {
          // TODO: 실제 구조에 맞게 변환 필요
          const formatted = res.data.map((a: any) => ({
            id: a.alertId?.toString() ?? "0",
            name: a.title ?? "알림 이름 없음",
            enabled: a.isActive ?? true,
            tags: a.conditions
              ? getIndicatorCategoriesArray(a.conditions)
              : ["조건"],
          }));
          setAlerts(formatted);
          console.log(`변환된 알림 수: ${formatted.length}`);
        }
      } catch (err) {
        console.error("[기업별 알림 조회 실패]:", err);
      }
    };

    fetchCompanyAlerts();
  }, [accessToken, id]);

  // 초기 애니메이션 설정
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    alerts.forEach((alert) => {
      anims[alert.id] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, [alerts]);

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
          onValueChange={() => setPriceOpenCloseEnabled((v) => !v)}
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
      />

      <SwipeListView
        data={filteredAlerts}
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
                  <Text style={styles.name}>{item.name}</Text>

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
