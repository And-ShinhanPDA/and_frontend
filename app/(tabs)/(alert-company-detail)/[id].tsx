import Arrow from "@/assets/images/arrow.svg";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
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
};

export default function CompanyAlertDetail() {
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80);

  // 고정 "시가/종가 알림" 스위치 상태
  const [priceOpenCloseEnabled, setPriceOpenCloseEnabled] =
    useState<boolean>(true);

  // TODO: API 연결
  const [alerts, setAlerts] = useState<AlertCondition[]>([
    {
      id: "1",
      name: "SMA량 거래량 조건",
      enabled: false,
      tags: [
        "SMA",
        "거래량",
        "52주",
        "볼린저밴드",
        "볼린저밴드",
        "볼린저밴드",
        "볼린저밴드",
        "볼린저밴드",
        "볼린저밴드",
      ],
    },
    {
      id: "2",
      name: "가격 설정 조건",
      enabled: true,
      tags: ["가격", "RSI", "52주", "SMA"],
    },
    {
      id: "3",
      name: "SMA 조건",
      enabled: true,
      tags: ["SMA", "거래량", "52주", "볼린저밴드"],
    },
    {
      id: "4",
      name: "볼린저 밴드 조건",
      enabled: true,
      tags: ["후행", "RSI", "52주", "SMA"],
    },
  ]);

  // 초기 애니메이션 설정
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    alerts.forEach((alert) => {
      anims[alert.id] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, [alerts]);

  // 토글 스위치
  const toggleSwitch = (id: string) => {
    setAlerts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // 삭제 기능
  const deleteCompany = (id: string) => {
    setAlerts((prev) => prev.filter((c) => c.id !== id));
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace("/(tabs)/(alert-condition)/alert-condition")
          }
        >
          <Arrow width={22} height={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>기업 알림 이름으로 바꿔야됨</Text>
      </View>

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
                  onValueChange={() => toggleSwitch(item.id)}
                  value={item.enabled}
                />
              </Animated.View>
            </View>
          );
        }}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onLayout={(e) => setDeleteWidth(e.nativeEvent.layout.width)}
              onPress={() => deleteCompany(item.id)}
            >
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/condition-additional/[id]")}
      >
        <Image
          source={require("@/assets/images/alert/condition_alert.png")}
          style={styles.plusIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  /* 화면 */
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },

  /* 헤더 */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: { position: "absolute", left: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#111",
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
    bottom: 40,
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
