import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BollingerBandCondition from "@/components/add-card/bollingerband/bollingerband-condition";
import ChangeConditionCard from "@/components/add-card/change/change-condition";
import PriceConditionCard from "@/components/add-card/price/price-condition";
import RSIConditionCard from "@/components/add-card/rsi/rsi-condition";
import SMAConditionCard from "@/components/add-card/sma/sma-condition";
import TrailingConditionCard from "@/components/add-card/trailing/trailing-condition";
import VolumeConditionCard from "@/components/add-card/volume/volume-condition";
import Week52ConditionCard from "@/components/add-card/week52/week52-condition";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { COMPANIES } from "@/constants/companies";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";

export default function ConditionAlertDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const tabs = ["제목", "가격", "52주", "거래량", "SMA", "RSI", "볼린저 밴드"];
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<any>(null);
  const [title, setTitle] = useState("");

  const [conditionGetters, setConditionGetters] = useState<{
    [k: string]: () => any[];
  }>({});

  const handleTempSave = useCallback((id: string, getter: () => any[]) => {
    setConditionGetters((prev) => ({ ...prev, [id]: getter }));
  }, []);

  // 조건 데이터를 각 카드 컴포넌트가 이해할 수 있는 형태로 파싱
  const parseConditionsForCards = (conditions: any[]) => {
    const parsed: any = {
      price: null,
      change: null,
      trailing: null,
      week52: null,
      volume: null,
      sma: null,
      rsi: null,
      bollinger: null,
    };

    // Price 조건 파싱
    const priceLimits: any[] = [];
    const openChanges: any[] = [];
    const currentChanges: any[] = [];

    // Change 조건 파싱
    const dailyChanges: any[] = [];
    const baseChanges: any[] = [];

    // Trailing 조건 파싱
    let trailingData: any = {
      stopPrice: "",
      stopPercent: "",
      buyPrice: "",
      buyPercent: "",
    };

    // Week52 조건 파싱
    let week52Data: any = {
      highAlert: false,
      lowAlert: false,
      highProximity: null,
      lowProximity: null,
    };

    // Volume 조건 파싱
    let volumeData: any = {
      avgRise: "",
      avgDrop: "",
      spike: false,
      drop: false,
    };

    // SMA 조건 파싱
    let smaData: any = { target: null, shortCross: false, longCross: false };

    // Bollinger 조건 파싱
    let bollingerData: any = { upper: false, lower: false };

    conditions.forEach((cond) => {
      const { indicator, threshold, threshold2 } = cond;

      // 가격 조건
      if (indicator === "PRICE_ABOVE") {
        priceLimits.push({ comparison: "이상", amount: threshold });
      } else if (indicator === "PRICE_BELOW") {
        priceLimits.push({ comparison: "이하", amount: threshold });
      } else if (indicator === "PRICE_CHANGE_DAILY_UP") {
        openChanges.push({ direction: "+", amount: threshold });
      } else if (indicator === "PRICE_CHANGE_DAILY_DOWN") {
        openChanges.push({ direction: "-", amount: threshold });
      } else if (indicator === "PRICE_CHANGE_BASE_UP") {
        currentChanges.push({ direction: "+", amount: threshold });
      } else if (indicator === "PRICE_CHANGE_BASE_DOWN") {
        currentChanges.push({ direction: "-", amount: threshold });
      }
      // 변동률 조건
      else if (indicator === "PRICE_RATE_DAILY_UP") {
        dailyChanges.push({ direction: "+", amount: threshold });
      } else if (indicator === "PRICE_RATE_DAILY_DOWN") {
        dailyChanges.push({ direction: "-", amount: threshold });
      } else if (indicator === "PRICE_RATE_BASE_UP") {
        baseChanges.push({ direction: "+", amount: threshold });
      } else if (indicator === "PRICE_RATE_BASE_DOWN") {
        baseChanges.push({ direction: "-", amount: threshold });
      }
      // 후행 조건
      else if (indicator === "TRAILING_STOP_PRICE") {
        trailingData.stopPrice = String(threshold || "");
      } else if (indicator === "TRAILING_STOP_PERCENT") {
        trailingData.stopPercent = String(threshold || "");
      } else if (indicator === "TRAILING_BUY_PRICE") {
        trailingData.buyPrice = String(threshold || "");
      } else if (indicator === "TRAILING_BUY_PERCENT") {
        trailingData.buyPercent = String(threshold || "");
      }
      // 52주 조건
      else if (indicator === "HIGH_52W") {
        week52Data.highAlert = true;
      } else if (indicator === "LOW_52W") {
        week52Data.lowAlert = true;
      } else if (indicator === "NEAR_HIGH_52W") {
        week52Data.highProximity = { value: threshold };
      } else if (indicator === "NEAR_LOW_52W") {
        week52Data.lowProximity = { value: threshold };
      }
      // 거래량 조건
      else if (indicator === "VOLUME_AVG_DEV_UP") {
        volumeData.avgRise = String(threshold || "");
      } else if (indicator === "VOLUME_AVG_DEV_DOWN") {
        volumeData.avgDrop = String(threshold || "");
      } else if (indicator === "VOLUME_CHANGE_PERCENT_UP") {
        volumeData.spike = true;
      } else if (indicator === "VOLUME_CHANGE_PERCENT_DOWN") {
        volumeData.drop = true;
      }
      // SMA 조건
      else if (indicator === "GOLDEN_CROSS") {
        smaData.shortCross = true;
      } else if (indicator === "DEAD_CROSS") {
        smaData.longCross = true;
      } else if (indicator.startsWith("SMA_")) {
        smaData.target = { indicator, threshold };
      }
      // RSI 조건
      else if (indicator === "RSI_OVER") {
        if (!parsed.rsi) parsed.rsi = { overbought: false, oversold: false };
        parsed.rsi.overbought = true;
      } else if (indicator === "RSI_UNDER") {
        if (!parsed.rsi) parsed.rsi = { overbought: false, oversold: false };
        parsed.rsi.oversold = true;
      }
      // 볼린저밴드 조건
      else if (indicator === "BOLLINGER_UPPER_TOUCH") {
        bollingerData.upper = true;
      } else if (indicator === "BOLLINGER_LOWER_TOUCH") {
        bollingerData.lower = true;
      }
    });

    // 가격 조건 설정
    if (
      priceLimits.length > 0 ||
      openChanges.length > 0 ||
      currentChanges.length > 0
    ) {
      parsed.price = {
        limits: priceLimits,
        openChanges: openChanges,
        currentChanges: currentChanges,
      };
    }

    // 변동률 조건 설정
    if (dailyChanges.length > 0 || baseChanges.length > 0) {
      parsed.change = {
        dailyChanges: dailyChanges,
        baseChanges: baseChanges,
      };
    }

    // 후행 조건 설정
    if (
      trailingData.stopPrice ||
      trailingData.stopPercent ||
      trailingData.buyPrice ||
      trailingData.buyPercent
    ) {
      parsed.trailing = trailingData;
    }

    // 52주 조건 설정
    if (
      week52Data.highAlert ||
      week52Data.lowAlert ||
      week52Data.highProximity ||
      week52Data.lowProximity
    ) {
      parsed.week52 = week52Data;
    }

    // 거래량 조건 설정
    if (
      volumeData.avgRise ||
      volumeData.avgDrop ||
      volumeData.spike ||
      volumeData.drop
    ) {
      parsed.volume = volumeData;
    }

    // SMA 조건 설정
    if (smaData.target || smaData.shortCross || smaData.longCross) {
      parsed.sma = smaData;
    }

    // 볼린저밴드 조건 설정
    if (bollingerData.upper || bollingerData.lower) {
      parsed.bollinger = bollingerData;
    }

    return parsed;
  };

  // 알림 상세 조회
  useEffect(() => {
    const fetchAlertDetail = async () => {
      if (!accessToken || !id) return;

      try {
        setLoading(true);
        const response = await alertService.getAlertDetail(
          accessToken,
          String(id)
        );
        console.log("알림 상세 조회 응답:", response);

        if (response?.data) {
          setAlertData(response.data);
          setTitle(response.data.title || "");
        }
      } catch (error) {
        console.error("알림 상세 조회 실패:", error);
        alert("알림 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlertDetail();
  }, [id, accessToken]);

  // 파싱된 조건 데이터 (useMemo로 최적화)
  const parsedConditions = useMemo(() => {
    return alertData?.conditions
      ? parseConditionsForCards(alertData.conditions)
      : null;
  }, [alertData?.conditions]);

  const handleSave = async () => {
    try {
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (!alertData) {
        alert("알림 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const mergedConditions = Object.values(conditionGetters)
        .map((fn) => fn())
        .flat()
        .filter(
          (c) =>
            c && c.indicator && (c.threshold === null || !isNaN(c.threshold))
        );

      const payload = {
        stockCode: alertData.stockCode,
        title: title || alertData.title,
        isActive: true,
        isPreset: false,
        conditions: mergedConditions,
      };

      const res = await alertService.updateAlert(
        accessToken,
        String(id),
        payload
      );
      console.log("알림 수정 성공:", res);
      alert("알림이 성공적으로 수정되었습니다!");

      // 기업 상세 페이지로 돌아가기 (2번 뒤로가기: 수정페이지 → 알림상세 → 기업상세)
      router.back(); // 수정 페이지 닫기
      router.back(); // 알림 상세 페이지 닫기 (기업 상세 페이지로)
      router.back(); // 기업 상세 페이지 닫기 (기업 목록으로)
    } catch (error: any) {
      console.error("알림 수정 실패:", error);
      if (error.response?.status === 401) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
      } else {
        alert("알림 수정 중 오류가 발생했습니다.");
      }
    }
  };
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4CC439" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          알림 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  if (!alertData) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ fontSize: 16, color: "#666" }}>
          알림 정보를 찾을 수 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <CustomHeader title="알림 수정" showBackButton={true} />

      {/* 탭 */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab, idx) => (
            <TouchableOpacity key={idx} style={styles.tabItem}>
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.tabBarBorder} />
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* 제목*/}
        <TextInput
          style={styles.titleInput}
          placeholder="이 조건을 대표할 수 있는 한 줄 제목"
          placeholderTextColor="#A4A4A4"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.divider} />

        {/* 조건 카드 - 파싱된 initialValue 전달 */}
        <PriceConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.price}
        />
        <ChangeConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.change}
        />
        <TrailingConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.trailing}
        />
        <Week52ConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.week52}
        />

        <VolumeConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.volume}
        />
        <SMAConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.sma}
        />

        <RSIConditionCard
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.rsi}
        />
        <BollingerBandCondition
          onTempSave={handleTempSave}
          initialValue={parsedConditions?.bollinger}
        />
      </ScrollView>

      {/* 하단 버튼 - 플로팅 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => setIsPresetOpen(true)}
        >
          <Text style={styles.presetText}>프리셋</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>수정하기</Text>
        </TouchableOpacity>
      </View>

      {/* 프리셋 */}
      <ConditionBottomSheet
        visible={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        ratio={0.8}
      >
        <PresetSelect onClose={() => setIsPresetOpen(false)} />
      </ConditionBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBarContainer: {
    position: "relative",
    marginBottom: 10,
    marginTop: 10,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabBarBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  tabItem: {
    marginRight: 20,
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    lineHeight: 20,
  },

  titleInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fff",
    marginVertical: 10,
  },

  divider: {
    height: 7,
    backgroundColor: "#F5F6F8",
    marginVertical: 10,
    marginHorizontal: -16,
    width: "100%",
    alignSelf: "stretch",
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  scrollContentContainer: {
    paddingBottom: 20,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    elevation: 5,
    paddingBottom: 30,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#F7F7F7",
  },
  presetText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginLeft: 8,
  },
  saveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
});
