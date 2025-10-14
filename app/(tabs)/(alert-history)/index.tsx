import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DoosanLogo from "@/assets/images/companies/logo_10_두산.svg";
import KiaLogo from "@/assets/images/companies/logo_11_기아.svg";
import ShinhanLogo from "@/assets/images/companies/logo_12_신한금융그룹.svg";
import KakaoLogo from "@/assets/images/companies/logo_13_카카오.svg";

export default function AlertHistory() {
  const [showPicker, setShowPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // TODO: companies랑 alertsByDate 나중에 바꿔야함
  const companies = [
    { id: "shinhan", name: "신한지주", Logo: ShinhanLogo },
    { id: "kia", name: "기아", Logo: KiaLogo },
    { id: "doosan", name: "두산", Logo: DoosanLogo },
    { id: "kakao", name: "카카오", Logo: KakaoLogo },
  ];

  const alertsByDate = [
    {
      date: "2025.09.16(화)",
      items: [
        {
          company: "shinhan",
          time: "11:43",
          title: "알림1",
          desc: "사용 지표: 50일 이동평균선(SMA), 200일 이동평균선(SMA), 거래량",
        },
        {
          company: "kia",
          time: "11:45",
          title: "알림2",
          desc: "사용 지표: 50일 이동평균선(SMA)",
        },
        {
          company: "kakao",
          time: "12:45",
          title: "알림3",
          desc: "사용 지표: 50일 이동평균선(SMA)",
        },
      ],
    },
    {
      date: "2025.09.15(월)",
      items: [
        {
          company: "doosan",
          time: "10:15",
          title: "알림1",
          desc: "사용 지표: 50일 이동평균선(SMA)",
        },
        {
          company: "kia",
          time: "12:45",
          title: "알림2",
          desc: "사용 지표: 50일 이동평균선(SMA)",
        },
      ],
    },
  ];

  const filteredAlerts = useMemo(() => {
    return alertsByDate
      .filter((group) => {
        const dateWithoutDay = group.date.split("(")[0].replace(/\./g, "-");
        const groupDate = new Date(dateWithoutDay);
        if (startDate && groupDate < startDate) return false;
        if (endDate && groupDate > endDate) return false;
        return true;
      })
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (selectedCompany && item.company !== selectedCompany) return false;
          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [alertsByDate, selectedCompany, startDate, endDate]);

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString("ko-KR") : "전체";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 기업 리스트 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.companyScroll}
        >
          {companies.map(({ id, Logo }) => (
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
              <Logo width={58} height={58} />
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

        {/* 알림 리스트 */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.dateSection}>
              {/* 날짜 + 가로선 */}
              <View style={styles.dateHeaderRow}>
                <Text style={styles.dateTextHeader}>{item.date}</Text>
                <View style={styles.dateDivider} />
              </View>

              {/* 타임라인 알림 */}
              {item.items.map((alert, index) => {
                const companyName =
                  companies.find((c) => c.id === alert.company)?.name ??
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
      </View>
    </SafeAreaView>
  );
}

export const options = { title: "알림 히스토리" };

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  companyScroll: { marginBottom: 20 },
  companyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  activeCompany: { borderWidth: 2, borderColor: "#4CC53A" },

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
