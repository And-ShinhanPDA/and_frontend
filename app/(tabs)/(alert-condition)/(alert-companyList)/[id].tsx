import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
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
  const headerScrollRef = useRef<ScrollView | null>(null);
  const dataScrollRef = useRef<ScrollView | null>(null);
  const leftFlatListRef = useRef<FlatList | null>(null);
  const rightFlatListRef = useRef<FlatList | null>(null);
  const scrollingRef = useRef(false);
  const verticalScrollingRef = useRef(false);
  const [isHorizontalScrolling, setIsHorizontalScrolling] = useState(false);

  const syncScroll = (offsetX: number) => {
    if (scrollingRef.current) return;

    scrollingRef.current = true;

    headerScrollRef.current?.scrollTo({ x: offsetX, animated: false });
    dataScrollRef.current?.scrollTo({ x: offsetX, animated: false });

    setTimeout(() => {
      scrollingRef.current = false;
    }, 10);
  };

  const syncVerticalScroll = (offsetY: number) => {
    if (verticalScrollingRef.current) return;

    verticalScrollingRef.current = true;

    leftFlatListRef.current?.scrollToOffset({
      offset: offsetY,
      animated: false,
    });
    rightFlatListRef.current?.scrollToOffset({
      offset: offsetY,
      animated: false,
    });

    setTimeout(() => {
      verticalScrollingRef.current = false;
    }, 10);
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
    {
      id: "5",
      name: "카카오",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "6",
      name: "LG전자",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "7",
      name: "SK하이닉스",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "8",
      name: "현대차",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "9",
      name: "LG전자",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "10",
      name: "SK하이닉스",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "11",
      name: "현대차",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "12",
      name: "LG전자",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "13",
      name: "SK하이닉스",
      logo: ShinhanLogo,
      currentPrice: "50,000원",
      openPrice: "50,000원",
      volume: "50",
      sma: "50",
    },
    {
      id: "14",
      name: "현대차",
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

      <View style={styles.conditionBox}>
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

        <View style={styles.conditionRight}>
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/(tabs)/(alert-condition)/(alert-companyList)/(alert-detail)/[id]"
              )
            }
          >
            <Image
              source={require("@/assets/images/alert/company_search.png")}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 테이블 헤더 */}
      <View style={styles.tableHeaderRow}>
        <View style={styles.fixedColumn}></View>

        <ScrollView
          horizontal
          ref={headerScrollRef}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          scrollEnabled={false}
          bounces={false}
          style={styles.headerScrollView}
        >
          <View style={styles.tableHeader}>
            <Text style={styles.headerText}>현재가</Text>
            <Text style={styles.headerText}>시가</Text>
            <Text style={styles.headerText}>거래량</Text>
            <Text style={styles.headerText}>SMA</Text>
          </View>
        </ScrollView>
      </View>

      {/* 테이블 바디 */}
      <View style={styles.tableBody}>
        {/* 왼쪽 고정 영역 (로고) */}
        <View style={styles.fixedColumnContainer}>
          <FlatList
            ref={leftFlatListRef}
            data={companies}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isHorizontalScrolling}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              syncVerticalScroll(e.nativeEvent.contentOffset.y);
            }}
            renderItem={({ item }) => (
              <View style={styles.fixedCell}>
                <item.logo width={48} height={48} style={styles.logo} />
              </View>
            )}
          />
        </View>

        {/* 오른쪽 스크롤 영역 (데이터) */}
        <ScrollView
          horizontal
          ref={dataScrollRef}
          showsHorizontalScrollIndicator={false}
          // scrollEventThrottle={3}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            syncScroll(e.nativeEvent.contentOffset.x);
          }}
          onScrollBeginDrag={() => setIsHorizontalScrolling(true)}
          onScrollEndDrag={() => setIsHorizontalScrolling(false)}
          onMomentumScrollEnd={() => setIsHorizontalScrolling(false)}
          directionalLockEnabled={true}
          bounces={false}
          style={styles.dataScrollView}
        >
          <FlatList
            ref={rightFlatListRef}
            data={companies}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isHorizontalScrolling}
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
              syncVerticalScroll(e.nativeEvent.contentOffset.y);
            }}
            nestedScrollEnabled={true}
            renderItem={({ item }) => (
              <View style={styles.dataRow}>
                <Text style={styles.dataText}>{item.currentPrice}</Text>
                <Text style={styles.dataText}>{item.openPrice}</Text>
                <Text style={styles.dataText}>{item.volume}</Text>
                <Text style={styles.dataText}>{item.sma}</Text>
              </View>
            )}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingTop: 20 },

  conditionBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  fixedColumn: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  headerScrollView: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
  },
  headerText: {
    width: 100,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Pretendard",
  },

  tableBody: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 22,
  },
  fixedColumnContainer: {
    width: 100,
  },
  fixedCell: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  dataScrollView: {
    flex: 1,
  },
  dataRow: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
  },
  dataText: {
    width: 100,
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Pretendard",
  },
});
