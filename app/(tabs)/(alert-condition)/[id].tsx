import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ShinhanLogo from "@/assets/images/companies/logo_12_신한금융그룹.svg";

type Company = {
  id: string;
  name: string;
  logo: any;
  currentPrice: string;
  openPrice: string;
  volume: string;
  sma: string;
};

export default function AlertConditionDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();

  // TODO: API
  const companies: Company[] = [
    {
      id: "1",
      name: "신한지주",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "2",
      name: "구글",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "3",
      name: "삼성전자",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "4",
      name: "네이버",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
  ];

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name || "조건 검색"}</Text>
      </View>

      {/* 조건 태그 */}
      <View style={styles.conditionBox}>
        <Text style={styles.conditionTitle}>{name || "가격 설정 조건"}</Text>
        <View style={styles.tagContainer}>
          {["가격", "RSI", "52주", "SMA"].map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 테이블 헤더 */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 1.5 }]}>현재가</Text>
        <Text style={[styles.headerText, { flex: 1.5 }]}>시가</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>거래량</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>SMA</Text>
      </View>

      {/* 기업 리스트 */}
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.companyRow}>
            <Image source={item.logo} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{item.name}</Text>
            </View>
            <View style={styles.companyData}>
              <Text style={[styles.dataText, { flex: 1.5 }]}>
                {item.currentPrice}
              </Text>
              <Text style={[styles.dataText, { flex: 1.5 }]}>
                {item.openPrice}
              </Text>
              <Text style={[styles.dataText, { flex: 1 }]}>{item.volume}</Text>
              <Text style={[styles.dataText, { flex: 1 }]}>{item.sma}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backArrow: {
    fontSize: 28,
    color: "#000",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  conditionBox: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    marginHorizontal: 22,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: "Pretendard",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Pretendard",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Pretendard",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
  },
  logo: {
    width: 34,
    height: 34,
    resizeMode: "contain",
    marginRight: 10,
  },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 14, fontFamily: "Pretendard" },
  companyData: {
    flexDirection: "row",
    flex: 4,
    justifyContent: "space-between",
  },
  dataText: {
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Pretendard",
  },
});
