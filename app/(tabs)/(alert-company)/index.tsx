import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ImageSourcePropType,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import CustomHeader from "@/components/header/header";
import { router } from "expo-router";
import { alertService } from "@/services/alert-service";
import { useAuth } from "@/contexts/AuthContext";

import { COMPANIES } from "@/constants/companies";
type CompanyAlert = {
  alertId: string;
  name: string;
  logo: ImageSourcePropType;
  alerts: number;
  enabled: boolean;
};

export default function AlertCompany() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80);

  const [companies, setCompanies] = useState<CompanyAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!accessToken) {
        console.log("accessToken 없음");
        return;
      }
      try {
        const res = await alertService.getUserAlerts(accessToken);
        console.log("[알림 응답]:", res);
        const rawList = Array.isArray(res.data) ? res.data : res.data?.data;

        if (Array.isArray(rawList)) {
          const formatted = rawList.map((a: any) => {
            const matchedCompany = COMPANIES.find(
              (c) => c.code === a.stockCode
            );

            return {
              alertId: String(a.alertId ?? a.id),
              name: matchedCompany?.name ?? a.title ?? "제목 없음",
              logo: matchedCompany!.logo,

              alerts: a.conditions?.length ?? 0,
              enabled: a.isActive ?? false,
            };
          });

          setCompanies(formatted);
          console.log(`변환된 알림 개수: ${formatted.length}`);
        } else {
          console.warn("알림 리스트 데이터 구조:", res.data);
        }
      } catch (err) {
        console.error("[알림 조회 실패]:");
      }
    };

    fetchAlerts();
  }, [accessToken]);

  // 초기 애니메이션 설정
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    companies.forEach((company) => {
      anims[company.alertId] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, []);

  // 토글 스위치
  const toggleSwitch = (id: string) => {
    setCompanies((prev) =>
      prev.map((c) => (c.alertId === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  // 삭제 기능
  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.alertId !== id));
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
        title="기업 알림"
        showBackButton={false}
        rightButtons="preset-and-mypage"
        onPresetPress={() => console.log("프리셋 열기")}
      />

      <View style={styles.searchWrapper}>
        <Image
          source={require("@/assets/images/alert/search.png")}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="기업을 검색해보세요"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* 리스트 */}
      <SwipeListView
        data={companies.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.alertId}
        onRowOpen={handleRowOpen}
        onRowClose={handleRowClose}
        rightOpenValue={-deleteWidth}
        leftOpenValue={0}
        disableLeftSwipe={false}
        disableRightSwipe={true}
        closeOnRowPress
        renderItem={({ item, index }) => {
          const fadeAnim =
            fadeAnimations[item.alertId] || new Animated.Value(1);
          const filtered = companies.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          );
          const isLast = index === filtered.length - 1;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(alert-company-detail)/[id]",
                  params: { id: item.alertId, name: item.name },
                })
              }
            >
              <View
                style={[
                  styles.itemRow,
                  isLast && { borderBottomWidth: 1, borderColor: "#F5F6F8" },
                ]}
              >
                <Image
                  source={item.logo as ImageSourcePropType}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />

                <View style={styles.itemText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.subText}>
                    현재 설정 알림: {item.alerts}개
                  </Text>
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
                    onValueChange={() => toggleSwitch(item.alertId)}
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
              onPress={() => deleteCompany(item.alertId)}
            >
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/(alert-company)/chooseCompany")}
      >
        <Image
          source={require("@/assets/images/alert/company_alert.png")}
          style={styles.plusIcon}
        />
      </TouchableOpacity>
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
    marginBottom: 18,
    height: 40,
    margin: 22,
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
  itemText: { flex: 1, marginLeft: 14 },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Pretendard" },
  subText: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
    fontFamily: "Pretendard",
  },
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
});
