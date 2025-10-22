import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AlertHistoryItem = {
  id: number;
  alertId: string;
  isSent: boolean;
  indicatorSnapshot: string;
  createdAt: string;
  stockCode?: string;
};

type AlertItem = {
  id?: number;
  company: string;
  time: string;
  title: string;
  desc: string;
  stockCode?: string;
  alertId?: string;
};

export default function AlertHistory() {
  const [showPicker, setShowPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showOnlyCondition, setShowOnlyCondition] = useState(false);
  const { accessToken, signOut, user } = useAuth();
  const [alertsByDate, setAlertsByDate] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<FlatList>(null);
  const [highlightedAlertId, setHighlightedAlertId] = useState<string | null>(
    null
  );
  // alertId -> 조건 이름 매핑 캐시
  const [alertNameCache, setAlertNameCache] = useState<Record<string, string>>(
    {}
  );

  const { highlightAlertId, highlightCompany, highlightHistoryId } =
    useLocalSearchParams<{
      highlightAlertId?: string;
      highlightCompany?: string;
      highlightHistoryId?: string;
    }>();

  useEffect(() => {
    if (highlightCompany) {
      const company = COMPANIES.find((c) => c.name === highlightCompany);
      if (company) {
        setSelectedCompany(company.id);
      }
    }
  }, [highlightCompany]);

  // 특정 알림 ID로 스크롤하는 함수
  const scrollToAlert = useCallback(
    (searchId: string, searchType: "id" | "alertId" = "id") => {
      if (!scrollViewRef.current || !alertsByDate.length) {
        console.log("[히스토리] 스크롤 조건 불만족:", {
          hasScrollRef: !!scrollViewRef.current,
          alertsLength: alertsByDate.length,
        });
        return;
      }

      const allAlerts = alertsByDate.flatMap((group) => group.items);
      console.log(
        "[히스토리] 전체 알림:",
        allAlerts.length,
        "개, 찾을",
        searchType + ":",
        searchId
      );

      // searchType에 따라 id 또는 alertId로 검색
      const targetAlert = allAlerts.find((alert) => {
        if (searchType === "id") {
          return String(alert?.id) === String(searchId);
        } else {
          return String(alert?.alertId) === String(searchId);
        }
      });

      console.log(
        "[히스토리] 찾은 알림:",
        targetAlert
          ? `있음 (id: ${targetAlert.id}, alertId: ${targetAlert.alertId})`
          : "없음"
      );

      if (targetAlert) {
        console.log(`[히스토리] ${searchType} ${searchId}로 스크롤 시도`);
        setHighlightedAlertId(String(targetAlert.id)); // 히스토리 ID로 하이라이트 설정

        // 해당 알림이 포함된 그룹 찾기
        const targetGroup = alertsByDate.find((group) =>
          group.items.some(
            (item: any) => String(item?.id) === String(targetAlert.id)
          )
        );

        if (targetGroup) {
          const groupIndex = alertsByDate.indexOf(targetGroup);
          const itemIndex = targetGroup.items.findIndex(
            (item: any) => String(item?.id) === String(targetAlert.id)
          );

          setTimeout(() => {
            try {
              const dateHeaderHeight = 25;
              const itemHeight = 70;
              const sectionMargin = 25;

              let offsetY = 0;
              for (let i = 0; i < groupIndex; i++) {
                offsetY += dateHeaderHeight;
                offsetY += alertsByDate[i].items.length * itemHeight;
                offsetY += sectionMargin;
              }

              offsetY += dateHeaderHeight;
              offsetY += itemIndex * itemHeight;

              offsetY -= itemHeight + 100;

              scrollViewRef.current?.scrollToOffset({
                offset: Math.max(0, offsetY),
                animated: true,
              });

              console.log(
                `[히스토리] ${searchType} ${searchId}로 정확히 스크롤 (그룹: ${groupIndex}, 아이템: ${itemIndex}, offset: ${offsetY})`
              );
            } catch (error) {
              console.log(`[히스토리] 스크롤 실패:`, error);
            }
          }, 300);
        }
      }
    },
    [alertsByDate]
  );

  // highlightHistoryId 또는 highlightAlertId가 있을 때 스크롤 실행
  useEffect(() => {
    if (alertsByDate.length > 0) {
      // highlightHistoryId가 있으면 우선 사용 (히스토리 고유 ID)
      if (highlightHistoryId) {
        scrollToAlert(highlightHistoryId, "id");

        // 5초 후 하이라이트 자동 해제
        const timer = setTimeout(() => {
          setHighlightedAlertId(null);
          console.log(`[히스토리] 하이라이트 자동 해제`);
        }, 5000);

        return () => clearTimeout(timer);
      }
      // highlightAlertId가 있으면 alertId로 검색 (같은 조건의 첫 번째 항목)
      else if (highlightAlertId) {
        scrollToAlert(highlightAlertId, "alertId");

        // 5초 후 하이라이트 자동 해제
        const timer = setTimeout(() => {
          setHighlightedAlertId(null);
          console.log(`[히스토리] 하이라이트 자동 해제`);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [highlightHistoryId, highlightAlertId, alertsByDate, scrollToAlert]);

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

  useFocusEffect(
    useCallback(() => {
      const fetchAlertHistory = async () => {
        if (!accessToken) return;

        try {
          setLoading(true);
          const formattedStart = startDate
            ? startDate.toISOString().split("T")[0]
            : undefined;
          const formattedEnd = endDate
            ? endDate.toISOString().split("T")[0]
            : undefined;

          // 선택된 기업이 있으면 해당 기업 코드 사용, 없으면 undefined로 전체 조회
          const companyData = selectedCompany
            ? COMPANIES.find((c) => c.id === selectedCompany)
            : null;

          const result: AlertHistoryItem[] = await alertService.getAlertHistory(
            accessToken,
            companyData?.code,
            formattedStart,
            formattedEnd
          );

          // alertId들을 수집하여 조건 이름 가져오기
          const uniqueAlertIds = Array.from(
            new Set(result.map((item) => item.alertId))
          );
          const newCache: Record<string, string> = { ...alertNameCache };

          // 캐시에 없는 alertId만 조회
          const uncachedAlertIds = uniqueAlertIds.filter((id) => !newCache[id]);

          if (uncachedAlertIds.length > 0) {
            console.log(
              `[히스토리] ${uncachedAlertIds.length}개의 조건 이름 조회 중...`
            );

            // 각 alertId에 대해 상세 정보 조회
            await Promise.all(
              uncachedAlertIds.map(async (alertId) => {
                try {
                  const detail = await alertService.getAlertDetail(
                    accessToken,
                    alertId
                  );
                  newCache[alertId] = detail.data?.title || `알림 ${alertId}`;
                } catch (err) {
                  console.error(`alertId ${alertId} 조회 실패:`, err);
                  newCache[alertId] = `알림 ${alertId}`;
                }
              })
            );

            setAlertNameCache(newCache);
            console.log(`[히스토리] 조건 이름 캐시 업데이트 완료`);
          }

          // ✅ 날짜별 그룹화
          const grouped: Record<string, any[]> = {};
          result.forEach((item) => {
            const date = item.createdAt.split("T")[0];
            if (!grouped[date]) grouped[date] = [];

            // stockCode를 기업 ID로 매핑
            let companyId = "unknown";
            if (selectedCompany) {
              // 특정 기업이 선택된 경우
              companyId = selectedCompany;
            } else if (item.stockCode) {
              // 전체 조회에서 stockCode로 기업 찾기
              const foundCompany = COMPANIES.find(
                (c) => c.code === item.stockCode
              );
              companyId = foundCompany?.id || item.stockCode;
            }

            // 캐시된 조건 이름 사용
            const conditionName =
              newCache[item.alertId] || `알림 ${item.alertId}`;

            const alertData = {
              id: item.id, // 히스토리 항목 고유 ID
              company: companyId,
              time: item.createdAt.split("T")[1].slice(0, 5),
              title: conditionName,
              desc: item.indicatorSnapshot || "조건 충족",
              stockCode: item.stockCode,
              alertId: item.alertId, // 조건 알림 ID
            };

            // 디버깅: 첫 3개 알림의 ID 출력
            if (grouped[date].length < 3) {
              console.log(
                "[히스토리 로드] id:",
                item.id,
                "alertId:",
                item.alertId,
                "조건명:",
                conditionName
              );
            }

            grouped[date].push(alertData);
          });

          const groupedArray = Object.entries(grouped).map(([date, items]) => ({
            date: date.replace(/-/g, ".") + "(알림)",
            items,
          }));

          setAlertsByDate(groupedArray);

          const logMessage = selectedCompany
            ? `[${companyData?.name}] 알림 ${result.length}건 로드 완료`
            : `전체 알림 ${result.length}건 로드 완료`;
          console.log(logMessage);
        } catch (err) {
          console.error("알림 이력 조회 실패:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAlertHistory();
    }, [selectedCompany, startDate, endDate, accessToken, alertNameCache])
  );

  // 날짜 & 기업 & 조건 필터링
  const filteredAlerts = useMemo(() => {
    return alertsByDate
      .filter((group) => {
        const dateWithoutDay = group.date.split("(")[0].replace(/\./g, "-");
        const groupDate = new Date(dateWithoutDay);

        // 날짜 범위 필터링
        if (startDate) {
          const startDateOnly = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
          const groupDateOnly = new Date(
            groupDate.getFullYear(),
            groupDate.getMonth(),
            groupDate.getDate()
          );
          if (groupDateOnly < startDateOnly) return false;
        }

        if (endDate) {
          const endDateOnly = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );
          const groupDateOnly = new Date(
            groupDate.getFullYear(),
            groupDate.getMonth(),
            groupDate.getDate()
          );
          if (groupDateOnly > endDateOnly) return false;
        }

        return true;
      })
      .map((group) => ({
        ...group,
        items: group.items.filter((item: AlertItem) => {
          // 기업 필터링
          if (selectedCompany && item.company !== selectedCompany) return false;

          // 조건 검색 필터링
          if (showOnlyCondition && item.stockCode !== "조건검색") return false;

          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [alertsByDate, selectedCompany, startDate, endDate, showOnlyCondition]);

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("ko-KR") : "전체";

  return (
    <View style={styles.container}>
      {/* 로딩 오버레이 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CC53A" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}
      <CustomHeader
        title="알림 히스토리"
        showBackButton={false}
        rightButtons="mypage"
        userName={user?.name || "사용자"}
        onLogoutConfirm={handleLogout}
      />

      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        {/* 고정된 상단 영역 */}
        <View style={styles.fixedTopSection}>
          {/* 기업 리스트 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.companyScroll}
          >
            {COMPANIES.map(({ id, logo, name }) => (
              <TouchableOpacity
                key={id}
                onPress={() => {
                  setLoading(true);
                  setSelectedCompany((prev) => (prev === id ? null : id));
                }}
                style={styles.companyItem}
              >
                <View
                  style={[
                    styles.companyCircle,
                    selectedCompany === id && styles.activeCompany,
                  ]}
                >
                  <Image
                    source={logo}
                    style={{
                      width: selectedCompany === id ? 70 : 72,
                      height: selectedCompany === id ? 70 : 72,
                      borderRadius: selectedCompany === id ? 35 : 36,
                    }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.companyName} numberOfLines={1}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 날짜 버튼 & 조건 검색 필터 */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4CC53A" />
              <Text style={styles.dateButtonText}>
                {formatDate(startDate)} ~ {formatDate(endDate)}
              </Text>
            </TouchableOpacity>

            <Pressable
              style={({ pressed }) => [
                styles.conditionFilterButton,
                !showOnlyCondition && styles.conditionFilterButtonActive,
                pressed && styles.conditionFilterButtonPressed,
              ]}
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  setShowOnlyCondition(!showOnlyCondition);
                  setLoading(false);
                }, 100);
              }}
            >
              <Text
                style={[
                  styles.conditionFilterText,
                  !showOnlyCondition && styles.conditionFilterTextActive,
                ]}
              >
                {showOnlyCondition ? "전체 보기" : "조건 검색 보기"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 스크롤 가능한 히스토리 영역 */}
        <View style={styles.historyContainer}>
          <FlatList
            ref={scrollViewRef}
            data={filteredAlerts}
            keyExtractor={(item, index) => `${item.date}-${index}`}
            contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            renderItem={({ item }) => (
              <View style={styles.dateSection}>
                {/* 날짜 + 가로선 */}
                <View style={styles.dateHeaderRow}>
                  <Text style={styles.dateTextHeader}>{item.date}</Text>
                  <View style={styles.dateDivider} />
                </View>

                {/* 타임라인 알림 */}
                {item.items.map((alert: AlertItem, index: number) => {
                  const companyName =
                    COMPANIES.find((c) => c.id === alert.company)?.name ??
                    alert.company;

                  // 하이라이트된 알림인지 확인 (id 필드 직접 사용, 타입 통일)
                  const isHighlighted =
                    String(highlightedAlertId) === String(alert.id);

                  // 조건검색 알림인지 확인
                  const isConditionSearch = alert.stockCode === "조건검색";

                  return (
                    <Pressable
                      key={`${alert.id || alert.alertId || index}-${index}`}
                      onPress={() => {
                        if (isConditionSearch) {
                          router.push("/(tabs)/(alert-condition)");
                        } else if (alert.stockCode) {
                          router.push({
                            pathname: "/(tabs)/(chart)/[chartId]",
                            params: {
                              chartId: alert.stockCode,
                              name: companyName,
                              stockCode: alert.stockCode,
                              highlightTime: alert.time,
                            },
                          });
                        }
                      }}
                      style={[
                        styles.timelineRow,
                        isHighlighted &&
                          !isConditionSearch &&
                          styles.highlightedRow,
                      ]}
                    >
                      <View style={styles.timeline}>
                        {index === 0 ? (
                          <View
                            style={
                              isConditionSearch
                                ? styles.conditionSearchOuterCircle
                                : styles.outerCircle
                            }
                          >
                            <View
                              style={
                                isConditionSearch
                                  ? styles.conditionSearchInnerDot
                                  : styles.innerDot
                              }
                            />
                          </View>
                        ) : (
                          <View
                            style={
                              isConditionSearch
                                ? styles.conditionSearchSingleCircle
                                : styles.singleCircle
                            }
                          />
                        )}
                        {index !== item.items.length - 1 && (
                          <View
                            style={
                              isConditionSearch
                                ? styles.conditionSearchLine
                                : styles.line
                            }
                          />
                        )}
                      </View>

                      <View style={styles.alertContent}>
                        <View style={styles.alertHeader}>
                          <Text
                            style={[
                              styles.alertTitle,
                              isHighlighted &&
                                !isConditionSearch &&
                                styles.highlightedTitle,
                            ]}
                          >
                            {companyName} | {alert.title}
                          </Text>
                          <Text
                            style={[
                              styles.alertTime,
                              isHighlighted &&
                                !isConditionSearch &&
                                styles.highlightedTime,
                            ]}
                          >
                            {alert.time}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.alertDesc,
                            isHighlighted &&
                              !isConditionSearch &&
                              styles.highlightedDesc,
                          ]}
                        >
                          {alert.desc}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {/* <Image
                  //source={require("@/assets/images/empty.png")}
                  style={styles.emptyIcon}
                /> */}
                <Text style={styles.emptyText}>알림 히스토리가 없습니다.</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>

      {/* 날짜 설정 모달 */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>조회 기간 설정</Text>
              <TouchableOpacity
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickButtonsContainer}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => {
                  const today = new Date();
                  setStartDate(today);
                  setEndDate(today);
                }}
              >
                <Text style={styles.quickButtonText}>오늘</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(today.getDate() - 7);
                  setStartDate(weekAgo);
                  setEndDate(today);
                }}
              >
                <Text style={styles.quickButtonText}>최근 7일</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => {
                  const today = new Date();
                  const monthAgo = new Date(today);
                  monthAgo.setMonth(today.getMonth() - 1);
                  setStartDate(monthAgo);
                  setEndDate(today);
                }}
              >
                <Text style={styles.quickButtonText}>최근 1개월</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>시작일</Text>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="spinner"
                  locale="ko-KR"
                  onChange={(e, d) => d && setStartDate(d)}
                  style={styles.datePicker}
                  maximumDate={endDate || new Date()}
                />
              </View>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>종료일</Text>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="spinner"
                  locale="ko-KR"
                  onChange={(e, d) => d && setEndDate(d)}
                  style={styles.datePicker}
                  minimumDate={startDate || undefined}
                  maximumDate={new Date()}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomBottomTab activeTab="히스토리" />
    </View>
  );
}

export const options = { title: "알림 히스토리" };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fixedTopSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  companyScroll: {
    marginBottom: 20,
  },
  companyItem: {
    alignItems: "center",
    marginRight: 12,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  companyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },
  activeCompany: { borderWidth: 2, borderColor: "#4CC53A" },
  companyLogo: {
    width: 62,
    height: 62,
    borderRadius: 29,
  },
  companyName: {
    marginTop: 6,
    fontSize: 11,
    color: "#666",
    fontFamily: "Pretendard",
    fontWeight: "500",
    textAlign: "center",
    width: 80,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateButtonText: {
    fontSize: 13,
    marginLeft: 6,
    color: "#333",
    fontFamily: "Pretendard",
  },
  conditionFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
  },
  conditionFilterButtonActive: {
    backgroundColor: "#4CC439",
    borderColor: "#4CC439",
  },
  conditionFilterButtonPressed: {
    opacity: 0.7,
  },
  conditionFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Pretendard",
  },
  conditionFilterTextActive: {
    color: "#fff",
  },

  dateSection: { marginBottom: 25 },
  dateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateTextHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
  },
  dateDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#C6C6C6",
    marginLeft: 8,
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  timeline: { width: 25, alignItems: "center" },
  outerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#4CC53A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  innerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CC53A",
  },
  singleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#4CC53A",
    backgroundColor: "#fff",
  },
  line: { width: 2, flex: 1, backgroundColor: "#4CC53A", marginTop: 2 },

  alertContent: { flex: 1, paddingLeft: 10 },
  alertHeader: { flexDirection: "row", justifyContent: "space-between" },
  alertTitle: { fontWeight: "600", fontSize: 14 },
  alertTime: { fontSize: 13, color: "#999" },
  alertDesc: { fontSize: 13, color: "#555", marginTop: 3, lineHeight: 18 },
  noAlert: { textAlign: "center", color: "#aaa", marginTop: 30 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    fontFamily: "Pretendard",
    fontWeight: "500",
    textAlign: "center",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  // 하이라이트 스타일
  highlightedRow: {
    backgroundColor: "#E8F5E9", // 연한 초록색 배경
    borderRadius: 8,
    padding: 8,
    marginVertical: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4CC53A", // 브랜드 초록색 왼쪽 테두리
  },
  highlightedTitle: {
    color: "#2E7D32", // 진한 초록색 텍스트
    fontWeight: "700",
  },
  highlightedTime: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  highlightedDesc: {
    color: "#2E7D32",
    fontWeight: "500",
  },

  // 조건검색 알림 타임라인 스타일 (노란색)
  conditionSearchOuterCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFB300",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  conditionSearchInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFB300",
  },
  conditionSearchSingleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFB300",
    backgroundColor: "#fff",
  },
  conditionSearchLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#FFB300",
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
  },
  resetButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  quickButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Pretendard",
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
    marginBottom: 10,
    fontFamily: "Pretendard",
  },
  datePicker: {
    transform: [{ scale: 0.75 }],
    height: 120,
  },
  closeBtn: {
    marginTop: 8,
    backgroundColor: "#4CC53A",
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: "Pretendard",
  },
});
