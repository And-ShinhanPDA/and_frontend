import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import RSIConditionCard from "@/components/add-card/rsi/rsi-condition";
import SMAConditionCard from "@/components/add-card/sma/sma-condition";
import VolumeConditionCard from "@/components/add-card/volume/volume-condition";
import Week52ConditionCard from "@/components/add-card/week52/week52-condition";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { alertService } from "@/services/alert-service";
import { refreshWidgetManually } from "@/services/widgetShare";
import { parseConditionsForCards } from "@/utils/parseConditions";

export default function ConditionAlertModify() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const tabs = ["변동률", "52주", "거래량", "SMA", "RSI", "볼린저밴드"];
  const { accessToken } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: View | null }>({});
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);
  const [title, setTitle] = useState("");

  const [conditionGetters, setConditionGetters] = useState<{
    [k: string]: () => any[];
  }>({});

  const handleTempSave = useCallback((id: string, getter: () => any[]) => {
    setConditionGetters((prev) => ({ ...prev, [id]: getter }));
  }, []);

  // 프리셋 조건을 각 카드 형식으로 변환
  const parsePresetConditions = useCallback((conditions: any[]) => {
    const parsed: any = {
      change: { dailyChanges: [], baseChanges: [] },
      week52: {
        highAlert: false,
        lowAlert: false,
        highProximity: null,
        lowProximity: null,
      },
      volume: { avgRise: null, avgDrop: null, spike: false },
      sma: { target: null, goldenCross: false, deadCross: false },
      rsi: { overbought: false, oversold: false },
      bollingerband: { upper: false, lower: false },
    };

    conditions.forEach((cond) => {
      const { indicator, threshold } = cond;
      const thresholdStr = threshold !== null ? String(threshold) : "";
      const absThresholdStr =
        threshold !== null ? String(Math.abs(threshold)) : "";

      // 변동률
      if (indicator === "PRICE_RATE_DAILY_UP") {
        parsed.change.dailyChanges.push({
          direction: "+",
          amount: absThresholdStr,
        });
      } else if (indicator === "PRICE_RATE_DAILY_DOWN") {
        parsed.change.dailyChanges.push({
          direction: "-",
          amount: absThresholdStr,
        });
      } else if (indicator === "PRICE_RATE_BASE_UP") {
        parsed.change.baseChanges.push({
          direction: "+",
          amount: absThresholdStr,
        });
      } else if (indicator === "PRICE_RATE_BASE_DOWN") {
        parsed.change.baseChanges.push({
          direction: "-",
          amount: absThresholdStr,
        });
      }
      // 52주
      else if (indicator === "HIGH_52W") parsed.week52.highAlert = true;
      else if (indicator === "LOW_52W") parsed.week52.lowAlert = true;
      else if (indicator === "NEAR_HIGH_52W")
        parsed.week52.highProximity = { value: thresholdStr };
      else if (indicator === "NEAR_LOW_52W")
        parsed.week52.lowProximity = { value: thresholdStr };
      // 거래량
      else if (indicator === "VOLUME_AVG_DEV_UP")
        parsed.volume.avgRise = thresholdStr;
      else if (indicator === "VOLUME_AVG_DEV_DOWN")
        parsed.volume.avgDrop = thresholdStr;
      else if (indicator === "VOLUME_CHANGE_PERCENT_UP")
        parsed.volume.spike = true;
      // SMA
      else if (indicator.startsWith("SMA_"))
        parsed.sma.target = { indicator, threshold };
      else if (indicator === "GOLDEN_CROSS") parsed.sma.goldenCross = true;
      else if (indicator === "DEAD_CROSS") parsed.sma.deadCross = true;
      // RSI
      else if (indicator === "RSI_OVER") parsed.rsi.overbought = true;
      else if (indicator === "RSI_UNDER") parsed.rsi.oversold = true;
      // 볼린저밴드
      else if (indicator === "BOLLINGER_UPPER")
        parsed.bollingerband.upper = true;
      else if (indicator === "BOLLINGER_LOWER")
        parsed.bollingerband.lower = true;
    });

    return parsed;
  }, []);

  // 프리셋 선택 핸들러
  const handlePresetSelect = useCallback(
    (presetId: number, conditions: any[]) => {
      console.log("프리셋 적용:", presetId, conditions);
      const parsed = parsePresetConditions(conditions);
      setPresetConditions(parsed);
      setIsPresetOpen(false);
    },
    [parsePresetConditions]
  );

  // 프리셋 적용을 위한 상태
  const [presetConditions, setPresetConditions] = useState<any>({});

  // 탭 터치 시 해당 섹션으로 스크롤
  const scrollToSection = (tabName: string) => {
    const sectionMap: { [key: string]: string } = {
      변동률: "change",
      "52주": "week52",
      거래량: "volume",
      SMA: "sma",
      RSI: "rsi",
      볼린저밴드: "bollingerband",
    };

    const sectionKey = sectionMap[tabName];
    const section = sectionRefs.current[sectionKey];

    if (section && scrollViewRef.current) {
      section.measureLayout(
        scrollViewRef.current as any,
        (_x, y) => {
          scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
        },
        () => {}
      );
    }
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
        showAlert({
          message: "알림 정보를 불러오는데 실패했습니다.",
          buttons: [{ text: "확인" }],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlertDetail();
  }, [id, accessToken]);

  // 파싱된 조건 데이터 (프리셋과 병합)
  const parsedConditions = useMemo(() => {
    const original = alertData?.conditions
      ? parseConditionsForCards(alertData.conditions)
      : null;

    // 프리셋이 적용되었으면 프리셋 조건을 우선 사용
    if (Object.keys(presetConditions).length > 0) {
      return {
        ...original,
        ...presetConditions,
      };
    }

    return original;
  }, [alertData?.conditions, presetConditions]);

  const handleSave = async () => {
    try {
      if (!accessToken) {
        showAlert({
          message: "로그인이 필요합니다.",
          buttons: [{ text: "확인" }],
        });
        return;
      }

      if (!alertData) {
        showAlert({
          message:
            "알림 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
          buttons: [{ text: "확인" }],
        });
        return;
      }

      setSaving(true);

      const mergedConditions = Object.values(conditionGetters)
        .map((fn) => fn())
        .flat()
        .filter(
          (c) =>
            c && c.indicator && (c.threshold === null || !isNaN(c.threshold))
        );

      const payload = {
        stockCode: null, // 조건 검색은 stockCode가 null
        title: title || alertData.title,
        isActive: true,
        isPreset: false,
        conditions: mergedConditions,
      };

      console.log(
        "📤 [조건 알림 수정] 전송할 payload:",
        JSON.stringify(payload, null, 2)
      );

      const res = await alertService.updateAlert(
        accessToken,
        String(id),
        payload
      );

      console.log("✅ [조건 알림 수정] 성공 - 전체 응답:", res);
      console.log(
        "🤖 [조건 알림 수정] AI 피드백:",
        res?.data?.aiFeedback || "(백엔드 응답에 없음)"
      );

      // 위젯 즉시 새로고침
      refreshWidgetManually();

      showAlert({
        message: "알림이 성공적으로 수정되었습니다!",
        buttons: [
          {
            text: "확인",
            onPress: () => {
              router.back(); // 수정 페이지에서 나가기
            },
          },
        ],
      });
    } catch (error: any) {
      console.error("알림 수정 실패:", error);
      if (error.response?.status === 401) {
        showAlert({
          message: "로그인 세션이 만료되었습니다. 다시 로그인 해주세요.",
          buttons: [{ text: "확인" }],
        });
      } else {
        showAlert({
          message: "알림 수정 중 오류가 발생했습니다.",
          buttons: [{ text: "확인" }],
        });
      }
    } finally {
      setSaving(false);
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
      <CustomHeader title="조건 수정" showBackButton={true} />

      {/* 탭 */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.tabItem}
              onPress={() => scrollToSection(tab)}
            >
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.tabBarBorder} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* 제목*/}
        <View
          ref={(ref) => (sectionRefs.current["title"] = ref)}
          collapsable={false}
          style={styles.titleCard}
        >
          <View style={styles.titleHeader}>
            <Text style={styles.titleLabel}>제목</Text>
          </View>
          <View style={styles.titleDivider} />
          <TextInput
            style={styles.titleInput}
            placeholder="이 조건을 대표할 수 있는 한 줄 제목"
            placeholderTextColor="#A4A4A4"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.divider} />

        {/* 조건 카드 - 파싱된 initialValue 전달 */}
        <View
          ref={(ref) => (sectionRefs.current["change"] = ref)}
          collapsable={false}
        >
          <ChangeConditionCard
            onTempSave={handleTempSave}
            initialValue={parsedConditions?.change}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["week52"] = ref)}
          collapsable={false}
        >
          <Week52ConditionCard
            onTempSave={handleTempSave}
            initialValue={parsedConditions?.week52}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["volume"] = ref)}
          collapsable={false}
        >
          <VolumeConditionCard
            onTempSave={handleTempSave}
            initialValue={parsedConditions?.volume}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["sma"] = ref)}
          collapsable={false}
        >
          <SMAConditionCard
            onTempSave={handleTempSave}
            initialValue={parsedConditions?.sma}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["rsi"] = ref)}
          collapsable={false}
        >
          <RSIConditionCard
            onTempSave={handleTempSave}
            initialValue={parsedConditions?.rsi}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["bollingerband"] = ref)}
          collapsable={false}
        >
          <BollingerBandCondition
            onTempSave={handleTempSave}
            initialValue={parsedConditions?.bollinger}
          />
        </View>
      </ScrollView>

      {/* 하단 버튼 - 플로팅 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => setIsPresetOpen(true)}
        >
          <Text style={styles.presetText}>프리셋 가져오기</Text>
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
        <PresetSelect
          mode="select"
          onClose={() => setIsPresetOpen(false)}
          onPresetSelect={handlePresetSelect}
        />
      </ConditionBottomSheet>

      {/* 커스텀 Alert */}
      <AlertComponent />

      {/* 로딩 오버레이 */}
      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CC439" />
          <Text style={styles.loadingText}>수정 중...</Text>
        </View>
      )}
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
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  tabBarContent: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingVertical: 14,
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
    marginRight: 24,
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
    fontFamily: "Pretendard",
  },

  titleCard: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Pretendard",
  },
  titleDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: -16,
  },
  titleInput: {
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fff",
    fontFamily: "Pretendard",
    paddingVertical: 4,
  },

  divider: {
    height: 8,
    backgroundColor: "#F5F6F8",
    marginVertical: 14,
    marginHorizontal: -20,
    width: "120%",
    alignSelf: "center",
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  scrollContentContainer: {
    paddingBottom: 100,
    paddingTop: 4,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingBottom: 32,
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "black",
  },
  presetText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Pretendard",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  saveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Pretendard",
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
});
