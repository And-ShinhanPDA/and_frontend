import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";

type CompanyAlert = {
  stockCode: string;
  name: string;
  logo?: ImageSourcePropType;
  alertCount: number;
  isToggle: boolean;
};

export default function AlertCompany() {
  const { accessToken, signOut, user } = useAuth();
  const [search, setSearch] = useState("");
  const [fadeAnimations, setFadeAnimations] = useState<
    Record<string, Animated.Value>
  >({});
  const [deleteWidth, setDeleteWidth] = useState(80);
  const [companies, setCompanies] = useState<CompanyAlert[]>([]);
  const [isPresetOpen, setIsPresetOpen] = useState(false);

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

  /* 기업 리스트 조회 */
  const fetchAlertedCompanies = async () => {
    if (!accessToken) {
      console.log("accessToken 없음");
      return;
    }
    try {
      const res = await alertService.getAlertedCompanies(accessToken);
      console.log("[알림 기업 응답]:", res);

      const rawList = Array.isArray(res) ? res : [];

      if (Array.isArray(rawList)) {
        const formatted: CompanyAlert[] = rawList.map((c: any) => {
          const matchedCompany = COMPANIES.find((comp) => comp.code === c.id);

          return {
            stockCode: c.id,
            name: c.name,
            logo: matchedCompany?.logo,
            alertCount: c.alertCount ?? 0,
            isToggle: c.isToggle ?? false,
          };
        });

        setCompanies(formatted);
        console.log(`변환된 기업 수: ${formatted.length}`);
      }
    } catch (err) {
      console.error("[알림 조회 실패]:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAlertedCompanies();
    }, [accessToken])
  );

  /* 초기 애니메이션 설정 */
  useEffect(() => {
    const anims: Record<string, Animated.Value> = {};
    companies.forEach((company) => {
      anims[company.stockCode] = new Animated.Value(1);
    });
    setFadeAnimations(anims);
  }, [companies]);

  /* 토글 스위치 */
  const toggleSwitch = async (stockCode: string) => {
    if (!accessToken) return;
    const target = companies.find((c) => c.stockCode === stockCode);
    if (!target) return;

    const newActive = !target.isToggle;
    try {
      setCompanies((prev) =>
        prev.map((c) =>
          c.stockCode === stockCode
            ? {
                ...c,
                isToggle: newActive,
              }
            : c
        )
      );

      await alertService.toggleCompanyAlerts(accessToken, stockCode, newActive);

      // API 호출 후 최신 데이터 다시 조회
      await fetchAlertedCompanies();

      console.log(
        `${target.name} 기업 알림 ${newActive ? "활성화" : "비활성화"} 완료`
      );
    } catch (err) {
      console.error("[기업 알림 토글 실패]:", err);

      setCompanies((prev) =>
        prev.map((c) =>
          c.stockCode === stockCode
            ? {
                ...c,
                isToggle: !newActive,
              }
            : c
        )
      );
    }
  };

  /* 삭제 기능 */
  const deleteCompany = async (stockCode: string) => {
    if (!accessToken) return;
    const target = companies.find((c) => c.stockCode === stockCode);
    if (!target) return;

    try {
      await alertService.deleteCompanyAlerts(accessToken, stockCode);
      setCompanies((prev) => prev.filter((c) => c.stockCode !== stockCode));
      console.log(`${target.name} 기업 알림 삭제 완료`);
    } catch (err) {
      console.error("[기업 알림 삭제 실패]:", err);
    }
  };

  /* 왼쪽 스와이프 시 fade out */
  const handleRowOpen = (rowKey: string) => {
    const fadeAnim = fadeAnimations[rowKey];
    if (!fadeAnim) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  /* 닫을 시 fade in */
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
          placeholder="기업을 검색해보세요"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <SwipeListView
        data={companies.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.stockCode}
        onRowOpen={handleRowOpen}
        onRowClose={handleRowClose}
        rightOpenValue={-deleteWidth}
        disableRightSwipe
        closeOnRowPress
        renderItem={({ item, index }) => {
          const fadeAnim =
            fadeAnimations[item.stockCode] || new Animated.Value(1);
          const filtered = companies.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          );
          const isLast = index === filtered.length - 1;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    "/(tabs)/(alert-company)/(alert-company-detail)/[id]",
                  params: { id: item.stockCode, name: item.name },
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
                  source={item.logo}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />

                <View style={styles.itemText}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.subText}>
                    현재 설정 알림: {item.isToggle ? item.alertCount ?? 0 : 0}개
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
                    onValueChange={() => toggleSwitch(item.stockCode)}
                    value={item.isToggle}
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
              onPress={() => deleteCompany(item.stockCode)}
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
});
