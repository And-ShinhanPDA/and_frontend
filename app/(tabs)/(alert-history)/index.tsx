import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { useFocusEffect } from "expo-router";
import { COMPANIES } from "@/constants/companies";

type AlertHistoryItem = {
  id: number;
  alertId: string;
  isSent: boolean;
  indicatorSnapshot: string;
  createdAt: string;
  stockCode?: string;
};

type AlertItem = {
  company: string;
  time: string;
  title: string;
  desc: string;
};

export default function AlertHistory() {
  const [showPicker, setShowPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const [alertsByDate, setAlertsByDate] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchAlertHistory = async () => {
        if (!accessToken) return;

        try {
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

            grouped[date].push({
              company: companyId,
              time: item.createdAt.split("T")[1].slice(0, 5),
              title: `알림 ${item.id}`,
              desc: item.indicatorSnapshot || "조건 충족",
            });
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
        }
      };

      fetchAlertHistory();
    }, [selectedCompany, startDate, endDate, accessToken])
  );

  // 날짜 & 기업 필터링
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
          if (selectedCompany && item.company !== selectedCompany) return false;
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [alertsByDate, selectedCompany, startDate, endDate]);

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("ko-KR") : "전체";

  return (
    <View style={styles.container}>
      <CustomHeader
        title="알림 히스토리"
        showBackButton={false}
        rightButtons="mypage"
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
            {COMPANIES.map(({ id, logo }) => (
              <TouchableOpacity
                key={id}
                onPress={() =>
                  setSelectedCompany((prev) => (prev === id ? null : id))
                }
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
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 날짜 버튼 */}
          <TouchableOpacity
            style={styles.dateButtonSingle}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#4CC53A" />
            <Text style={styles.dateButtonText}>
              {formatDate(startDate)} ~ {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 스크롤 가능한 히스토리 영역 */}
        <View style={styles.historyContainer}>
          <FlatList
            data={filteredAlerts}
            keyExtractor={(item) => item.date}
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
                  return (
                    <View key={index} style={styles.timelineRow}>
                      <View style={styles.timeline}>
                        {index === 0 ? (
                          <View style={styles.outerCircle}>
                            <View style={styles.innerDot} />
                          </View>
                        ) : (
                          <View style={styles.singleCircle} />
                        )}
                        {index !== item.items.length - 1 && (
                          <View style={styles.line} />
                        )}
                      </View>

                      <View style={styles.alertContent}>
                        <View style={styles.alertHeader}>
                          <Text style={styles.alertTitle}>
                            {companyName} | {alert.title}
                          </Text>
                          <Text style={styles.alertTime}>{alert.time}</Text>
                        </View>
                        <Text style={styles.alertDesc}>{alert.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noAlert}>기록이 없습니다.</Text>
            }
          />
        </View>
      </SafeAreaView>

      {/* 날짜 설정 모달 */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>조회 기간 설정</Text>

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
      <CustomBottomTab activeTab="기록" />
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
    marginRight: 10,
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

  dateButtonSingle: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 25,
  },
  dateButtonText: { fontSize: 13, marginLeft: 6, color: "#333" },

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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  pickerColumn: { flex: 1, alignItems: "center" },
  pickerLabel: { fontSize: 14, color: "#333", marginTop: 35 },
  datePicker: { transform: [{ scale: 0.65 }], height: 90 },
  closeBtn: {
    marginTop: 12,
    backgroundColor: "#4CC53A",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  closeText: { color: "#fff", fontWeight: "600" },
});
