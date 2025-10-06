import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
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
  const [scrollX, setScrollX] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };

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
      <View style={styles.header}></View>

      {/* ✅ 제목/태그와 아이콘을 좌우 분리 */}
      <View style={styles.conditionBox}>
        {/* 왼쪽: 제목 + 태그 */}
        <View style={styles.conditionLeft}>
          <Text style={styles.conditionTitle}>
            {name || "제목 없는 조건 알림"}
          </Text>
          <View style={styles.tagContainer}>
            {["가격", "RSI", "52주", "SMA"].map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 오른쪽: 아이콘 중앙 정렬 */}
        <View style={styles.conditionRight}>
          <Image
            source={require("@/assets/images/alert/company_search.png")}
            style={{ width: 24, height: 24 }}
          />
        </View>
      </View>

      {/* ✅ 테이블 헤더 */}
      <View style={styles.tableRow}>
        <View style={styles.fixedColumn}></View>

        <ScrollView
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>현재가</Text>
            <Text style={styles.headerText}>시가</Text>
            <Text style={styles.headerText}>거래량</Text>
            <Text style={styles.headerText}>SMA</Text>
          </View>
        </ScrollView>
      </View>

      {/* ✅ 기업 리스트 */}
      <FlatList
        data={companies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <View style={styles.fixedColumn}>
              <item.logo width={48} height={48} style={styles.logo} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              contentOffset={{ x: scrollX, y: 0 }}
              onScroll={(e) => {
                scrollRef.current?.scrollTo({
                  x: e.nativeEvent.contentOffset.x,
                  animated: false,
                });
              }}
            >
              <View style={styles.dataRow}>
                <Text style={styles.dataText}>{item.currentPrice}</Text>
                <Text style={styles.dataText}>{item.openPrice}</Text>
                <Text style={styles.dataText}>{item.volume}</Text>
                <Text style={styles.dataText}>{item.sma}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingTop: 20 },

  /* ✅ 제목/태그 컨테이너 */
  conditionBox: {
    flexDirection: "row", // 왼쪽-오른쪽 분리
    justifyContent: "space-between",
    alignItems: "center", // 수직 중앙
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 6,
    marginHorizontal: 22,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 17,
  },
  conditionLeft: {
    flex: 1,
  },
  conditionRight: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  conditionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: "Pretendard",
  },
  tagContainer: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  tagText: { fontSize: 12, fontFamily: "Pretendard" },

  /* ✅ 표 관련 */
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  fixedColumn: {
    width: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeader: { flexDirection: "row" },
  headerText: {
    width: 100,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Pretendard",
  },
  logo: { width: 30, height: 30, resizeMode: "contain" },
  dataRow: { flexDirection: "row" },
  dataText: {
    width: 100,
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Pretendard",
  },
});
