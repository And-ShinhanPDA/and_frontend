import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { presetService } from "@/services/preset-service";
import { refreshWidgetManually } from "@/services/widgetShare";

export default function ConditionAdditional() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { accessToken } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const tabs = ["제목", "가격", "52주", "거래량", "SMA", "RSI", "볼린저 밴드"];

  const [conditionGetters, setConditionGetters] = useState<{
    [k: string]: () => any[];
  }>({});

  // 프리셋 적용을 위한 상태
  const [presetConditions, setPresetConditions] = useState<{
    change?: any;
    week52?: any;
    volume?: any;
    sma?: any;
    rsi?: any;
    bollingerband?: any;
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
      volume: {
        avgRise: null,
        avgDrop: null,
        spike: false,
        drop: false,
      },
      sma: { shortCross: false, longCross: false, target: null },
      rsi: { overbought: false, oversold: false },
      bollingerband: { upper: false, lower: false },
    };

    conditions.forEach((cond) => {
      const { indicator, threshold } = cond;

      // threshold가 null이 아닐 때만 문자열로 변환
      const thresholdStr = threshold !== null ? String(threshold) : "";
      // +/- 부호가 있는 필드는 절댓값만 사용
      const absThresholdStr =
        threshold !== null ? String(Math.abs(threshold)) : "";

      // 일간 등락률 (Change) 관련
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

      // 52주 관련
      else if (indicator === "HIGH_52W") {
        parsed.week52.highAlert = true;
      } else if (indicator === "LOW_52W") {
        parsed.week52.lowAlert = true;
      } else if (indicator === "NEAR_HIGH_52W") {
        parsed.week52.highProximity = { value: thresholdStr };
      } else if (indicator === "NEAR_LOW_52W") {
        parsed.week52.lowProximity = { value: thresholdStr };
      }

      // 거래량 관련
      else if (indicator === "VOLUME_AVG_DEV_UP") {
        parsed.volume.avgRise = thresholdStr;
      } else if (indicator === "VOLUME_AVG_DEV_DOWN") {
        parsed.volume.avgDrop = thresholdStr;
      } else if (indicator === "VOLUME_CHANGE_PERCENT_UP") {
        parsed.volume.spike = true;
      } else if (indicator === "VOLUME_CHANGE_PERCENT_DOWN") {
        parsed.volume.drop = true;
      }

      // SMA 관련
      else if (indicator.startsWith("SMA_")) {
        parsed.sma.target = { indicator, threshold };
      } else if (indicator === "GOLDEN_CROSS") {
        parsed.sma.shortCross = true;
      } else if (indicator === "DEAD_CROSS") {
        parsed.sma.longCross = true;
      }

      // RSI 관련
      else if (indicator === "RSI_OVER") {
        parsed.rsi.overbought = true;
      } else if (indicator === "RSI_UNDER") {
        parsed.rsi.oversold = true;
      }

      // 볼린저 밴드 관련
      else if (indicator === "BOLLINGER_UPPER_TOUCH") {
        parsed.bollingerband.upper = true;
      } else if (indicator === "BOLLINGER_LOWER_TOUCH") {
        parsed.bollingerband.lower = true;
      }
    });

    return parsed;
  }, []);

  // 프리셋 선택 시 호출
  const handlePresetSelect = useCallback(
    (presetId: number, conditions: any[]) => {
      console.log("프리셋 적용:", presetId, conditions);
      const parsed = parsePresetConditions(conditions);
      console.log("파싱된 조건:", parsed);
      setPresetConditions(parsed);
    },
    [parsePresetConditions]
  );

  const handleSave = async () => {
    try {
      if (!accessToken) {
        showAlert({
          message: "로그인이 필요합니다.",
          buttons: [{ text: "확인" }],
        });
        return;
      }

      setLoading(true);

      const mergedConditions = Object.values(conditionGetters)
        .map((fn) => fn())
        .flat()
        .filter(
          (c) =>
            c && c.indicator && (c.threshold === null || !isNaN(c.threshold))
        );

      const payload = {
        stockCode: null,
        title: title || "조건 알림",
        isActive: true,
        isPreset: false,
        conditions: mergedConditions,
      };

      const res = await alertService.createAlert(payload, accessToken);
      console.log("알림 등록 성공:", res);
      setLoading(false);

      // 위젯 즉시 새로고침
      refreshWidgetManually();

      // 프리셋 등록 여부 확인
      showAlert({
        title: "프리셋 등록",
        message: "프리셋으로도 등록하시겠습니까?",
        buttons: [
          {
            text: "아니오",
            style: "cancel",
            onPress: () => {
              // 바로 조건 검색 화면으로 이동
              router.replace("/(tabs)/(alert-condition)");
            },
          },
          {
            text: "네",
            onPress: async () => {
              setLoading(true);
              try {
                // 프리셋으로 저장
                const presetPayload = {
                  title: title || "조건 알림",
                  conditions: mergedConditions,
                  category: "custom",
                };

                console.log("[프리셋 추가] payload:", presetPayload);
                await presetService.createPreset(accessToken, presetPayload);
                console.log("[프리셋 추가 성공]");
                setLoading(false);

                // 바로 조건 검색 화면으로 이동
                router.replace("/(tabs)/(alert-condition)");
              } catch (presetError) {
                console.error("[프리셋 추가 실패]:", presetError);
                setLoading(false);

                // 에러가 있어도 조건 검색 화면으로 이동
                router.replace("/(tabs)/(alert-condition)");
              }
            },
          },
        ],
      });
    } catch (error: any) {
      console.error("알림 등록 실패:", error);
      setLoading(false);
      if (error.response?.status === 401) {
        showAlert({
          message: "로그인 세션이 만료되었습니다. 다시 로그인 해주세요.",
          buttons: [{ text: "확인" }],
        });
      } else {
        showAlert({
          message: "알림 등록 중 오류가 발생했습니다.",
          buttons: [{ text: "확인" }],
        });
      }
    }
  };
  return (
    <View style={styles.container}>
      {/* 로딩 오버레이 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CC439" />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      )}

      {/* 헤더 */}
      <CustomHeader title="조건 알림 추가" showBackButton={true} />

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
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.titleInput}
          placeholder="이 조건을 대표할 수 있는 한 줄 제목"
          placeholderTextColor="#A4A4A4"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.divider} />

        {/* 조건 카드 */}
        <ChangeConditionCard
          onTempSave={handleTempSave}
          initialValue={presetConditions.change}
        />
        <Week52ConditionCard
          onTempSave={handleTempSave}
          initialValue={presetConditions.week52}
        />

        <VolumeConditionCard
          onTempSave={handleTempSave}
          initialValue={presetConditions.volume}
        />
        <SMAConditionCard
          onTempSave={handleTempSave}
          initialValue={presetConditions.sma}
        />

        <RSIConditionCard
          onTempSave={handleTempSave}
          initialValue={presetConditions.rsi}
        />
        <BollingerBandCondition
          onTempSave={handleTempSave}
          initialValue={presetConditions.bollingerband}
        />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => setIsPresetOpen(true)}
        >
          <Text style={styles.presetText}>프리셋</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
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

  titleInput: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fff",
    marginVertical: 12,
    fontFamily: "Pretendard",
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
    backgroundColor: "#F9F9F9",
  },
  presetText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  saveButton: {
    flex: 1,
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
