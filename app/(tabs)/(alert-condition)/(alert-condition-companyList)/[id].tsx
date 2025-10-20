import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import { CustomBottomTab } from "@/components/bottom/bottom";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";

type Company = {
  stockCode: string;
  triggerDate: string;
  values: {
    [key: string]: any;
  };
  name?: string;
  logo?: any;
  formattedValues?: { [key: string]: string };
};

// Redis 필드명과 UI 표시명 매핑
const FIELD_MAPPING: { [key: string]: string } = {
  price: "현재가",
  volume: "거래량",
  openPrice: "시가",
  highPrice: "52주 최고가",
  lowPrice: "52주 최저가",
  rsi14: "RSI(14)",
  bbUpper: "볼린저밴드 상단",
  bbLower: "볼린저밴드 하단",
  sma5: "SMA(5)",
  sma10: "SMA(10)",
  sma20: "SMA(20)",
  sma30: "SMA(30)",
  sma50: "SMA(50)",
  sma100: "SMA(100)",
  sma200: "SMA(200)",
};

const formatValue = (fieldName: string, value: any): string => {
  if (value === null || value === undefined) return "-";

  const priceFields = [
    "price",
    "openPrice",
    "highPrice",
    "lowPrice",
    "bbUpper",
    "bbLower",
  ];
  if (priceFields.includes(fieldName)) {
    return `${value.toLocaleString()}원`;
  }

  if (fieldName === "volume") {
    return value.toLocaleString();
  }

  const decimalFields = [
    "rsi14",
    "sma5",
    "sma10",
    "sma20",
    "sma30",
    "sma50",
    "sma100",
    "sma200",
  ];
  if (decimalFields.includes(fieldName)) {
    return value.toFixed(2);
  }

  return String(value);
};

const getCompanyLogo = (stockCode: string) => {
  const company = COMPANIES.find((comp) => comp.code === stockCode);
  return (
    company?.logo || COMPANIES.find((comp) => comp.code === "055550")?.logo
  );
};
const getCompanyName = (stockCode: string) => {
  const company = COMPANIES.find((comp) => comp.code === stockCode);
  return company?.name || `기업${stockCode}`;
};

export default function AlertConditionDetail() {
  const { id, name, tags } = useLocalSearchParams<{
    id: string;
    name: string;
    tags: string;
  }>();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const { signOut, user, accessToken } = useAuth();

  const parsedTags = tags ? JSON.parse(tags) : [];
  const headerScrollRef = useRef<ScrollView | null>(null);
  const dataScrollRef = useRef<ScrollView | null>(null);
  const leftFlatListRef = useRef<FlatList | null>(null);
  const rightFlatListRef = useRef<FlatList | null>(null);
  const scrollingRef = useRef(false);
  const verticalScrollingRef = useRef(false);
  const [isHorizontalScrolling, setIsHorizontalScrolling] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  const fetchConditionResults = async () => {
    if (!accessToken || !id) {
      setError("인증 토큰 또는 알림 ID가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const results = await alertService.getConditionSearchResults(
        accessToken,
        id
      );

      const firstItem = results[0];
      const fields = firstItem ? Object.keys(firstItem.values || {}) : [];
      const validFields = fields.filter((field) => FIELD_MAPPING[field]);

      console.log("사용 가능한 필드들:", validFields);
      setAvailableFields(validFields);

      const formattedCompanies: Company[] = results.map((item: any) => {
        const formattedValues: { [key: string]: string } = {};

        validFields.forEach((field) => {
          formattedValues[field] = formatValue(field, item.values?.[field]);
        });

        return {
          stockCode: item.stockCode,
          triggerDate: item.triggerDate,
          values: item.values,
          name: getCompanyName(item.stockCode),
          logo: getCompanyLogo(item.stockCode),
          formattedValues,
        };
      });

      setCompanies(formattedCompanies);
      console.log(
        `조건 검색 결과 ${formattedCompanies.length}개 기업 로드 완료`
      );
      console.log("포맷팅된 값들:", formattedCompanies[0]?.formattedValues);
    } catch (err: any) {
      console.error("조건 검색 결과 조회 실패:", err);
      setError(
        err.response?.data?.message || "데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditionResults();
  }, [id, accessToken]);

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("로그아웃 성공");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

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

  return (
    <View style={styles.container}>
      <CustomHeader
        title="조건 검색"
        showBackButton={true}
        rightButtons="preset-and-mypage"
        onPresetPress={() => setIsPresetOpen(true)}
        userName={user?.name || "사용자"}
        onLogoutConfirm={handleLogout}
      />

      <View style={styles.conditionBox}>
        <View style={styles.conditionLeft}>
          <Text style={styles.conditionTitle}>
            {name || "제목 없는 조건 알림"}
          </Text>
          <View style={styles.tagContainer}>
            {parsedTags.map((tag: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.conditionRight}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname:
                  "/(tabs)/(alert-condition)/(alert-condition-detail)/[id]",
                params: { id: id, name: name, tags: tags },
              })
            }
          >
            <Image
              source={require("@/assets/images/alert/company_search.png")}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            조건 검색 결과를 불러오는 중...
          </Text>
        </View>
      )}

      {/* 에러 상태 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchConditionResults}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 기업 리스트 제목 - 데이터가 있을 때만 표시 */}
      {!loading && !error && companies.length > 0 && (
        <View style={styles.listTitleContainer}>
          <Text style={styles.listTitle}>해당 조건에 만족한 기업 리스트</Text>
          <View style={styles.listTitleDivider} />
        </View>
      )}

      {/* 테이블 헤더 - 데이터가 있을 때만 표시 */}
      {!loading && !error && companies.length > 0 && (
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
              {availableFields.map((field) => (
                <Text key={field} style={styles.headerText}>
                  {FIELD_MAPPING[field]}
                </Text>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 테이블 바디 - 데이터가 있을 때만 표시 */}
      {!loading && !error && companies.length > 0 && (
        <View style={styles.tableBody}>
          {/* 왼쪽 고정 영역 (로고) */}
          <View style={styles.fixedColumnContainer}>
            <FlatList
              ref={leftFlatListRef}
              data={companies}
              keyExtractor={(item) => item.stockCode}
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
                  <Image
                    source={item.logo}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* 오른쪽 스크롤 영역 (데이터) */}
          <ScrollView
            horizontal
            ref={dataScrollRef}
            showsHorizontalScrollIndicator={false}
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
              keyExtractor={(item) => item.stockCode}
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
                  {availableFields.map((field) => (
                    <Text key={field} style={styles.dataText}>
                      {item.formattedValues?.[field] || "-"}
                    </Text>
                  ))}
                </View>
              )}
            />
          </ScrollView>
        </View>
      )}

      {/* 데이터가 없을 때 메시지 */}
      {!loading && !error && companies.length === 0 && (
        <View style={styles.emptyContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>조건에 해당하는 기업이 없습니다.</Text>
        </View>
      )}

      {/* 프리셋 모달 */}
      <ConditionBottomSheet
        visible={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        ratio={0.85}
      >
        <PresetSelect 
          onClose={() => setIsPresetOpen(false)} 
          mode="view"
        />
      </ConditionBottomSheet>

      <CustomBottomTab activeTab="조건 검색" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  conditionBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 6,
    marginHorizontal: 22,
    marginBottom: 20,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 17,
  },
  conditionLeft: {
    flex: 1,
  },
  conditionRight: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 0,
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
    marginBottom: 4,
  },
  tagText: { fontSize: 12, fontFamily: "Pretendard" },

  listTitleContainer: {
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
    marginBottom: 8,
  },
  listTitleDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },

  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  fixedColumn: {
    width: 60,
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
    width: 60,
  },
  fixedCell: {
    height: 60,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F5F6F8",
    paddingHorizontal: 4,
  },
  logo: {
    width: 34,
    height: 34,
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 2,
  },
  companyName: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    fontFamily: "Pretendard",
    fontWeight: "500",
    maxWidth: 90,
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

  // 로딩 상태 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Pretendard",
  },

  // 에러 상태 스타일
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Pretendard",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Pretendard",
  },

  // 빈 데이터 상태 스타일
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    fontFamily: "Pretendard",
    fontWeight: "500",
  },
});
