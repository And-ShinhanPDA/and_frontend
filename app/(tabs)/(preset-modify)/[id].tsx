import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { presetService } from "@/services/preset-service";

// 프리셋 조건을 각 카드 형식으로 변환 (컴포넌트 외부에 정의)
const parsePresetConditions = (conditions: any[]) => {
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
};

export default function PresetModify() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { accessToken } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [conditionGetters, setConditionGetters] = useState<{
    [k: string]: () => any[];
  }>({});

  // 프리셋 적용을 위한 상태 (기존 데이터 로드용)
  const [presetConditions, setPresetConditions] = useState<{
    change?: any;
    week52?: any;
    volume?: any;
    sma?: any;
    rsi?: any;
    bollingerband?: any;
  }>({});

  const handleTempSave = useCallback(
    (conditionId: string, getter: () => any[]) => {
      setConditionGetters((prev) => ({ ...prev, [conditionId]: getter }));
    },
    []
  );

  // 프리셋 데이터 불러오기 (한 번만 실행)
  useEffect(() => {
    if (dataLoaded) return; // 이미 로드됨

    const fetchPresetData = async () => {
      if (!accessToken || !id) return;

      try {
        setLoading(true);
        const response = await presetService.getPresetList(accessToken);
        console.log("프리셋 목록 조회:", response);

        if (response?.data) {
          const preset = response.data.find(
            (p: any) => p.presetId === Number(id)
          );
          if (preset) {
            console.log("수정할 프리셋:", preset);
            setTitle(preset.title || "");

            // 조건 파싱
            const parsed = parsePresetConditions(preset.conditions || []);
            console.log("파싱된 조건:", parsed);
            setPresetConditions(parsed);
            setDataLoaded(true); // 로드 완료 표시
          } else {
            showAlert({
              message: "프리셋을 찾을 수 없습니다.",
              buttons: [
                {
                  text: "확인",
                  onPress: () => router.back(),
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error("프리셋 조회 실패:", error);
        showAlert({
          message: "프리셋 정보를 불러오는데 실패했습니다.",
          buttons: [
            {
              text: "확인",
              onPress: () => router.back(),
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPresetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accessToken]);

  const handleSave = async () => {
    try {
      if (!accessToken) {
        showAlert({
          message: "로그인이 필요합니다.",
          buttons: [{ text: "확인" }],
        });
        return;
      }

      if (!title.trim()) {
        showAlert({
          message: "프리셋 제목을 입력해주세요.",
          buttons: [{ text: "확인" }],
        });
        return;
      }

      const mergedConditions = Object.values(conditionGetters)
        .map((fn) => fn())
        .flat()
        .filter(
          (c) =>
            c && c.indicator && (c.threshold === null || !isNaN(c.threshold))
        );

      if (mergedConditions.length === 0) {
        showAlert({
          message: "최소 1개 이상의 조건을 설정해주세요.",
          buttons: [{ text: "확인" }],
        });
        return;
      }

      const payload = {
        title: title,
        conditions: mergedConditions,
        category: "custom",
      };

      console.log("[프리셋 수정] payload:", payload);
      const res = await presetService.updatePreset(
        accessToken,
        String(id),
        payload
      );
      console.log("[프리셋 수정 성공]:", res);

      showAlert({
        message: "프리셋이 수정되었습니다.",
        buttons: [
          {
            text: "확인",
            onPress: () => router.back(),
          },
        ],
      });
    } catch (error: any) {
      console.error("[프리셋 수정 실패]:", error);
      showAlert({
        message: error.response?.data?.message || "프리셋 수정에 실패했습니다.",
        buttons: [{ text: "확인" }],
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CC439" />
        <Text style={styles.loadingText}>프리셋을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="프리셋 수정" showBackButton={true} />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 입력 */}
        <View style={styles.titleCard}>
          <View style={styles.titleHeader}>
            <Text style={styles.titleLabel}>제목</Text>
          </View>
          <View style={styles.titleDivider} />
          <TextInput
            style={styles.titleInput}
            placeholder="프리셋 제목을 입력하세요"
            placeholderTextColor="#A4A4A4"
            value={title}
            onChangeText={setTitle}
          />
        </View>

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

      {/* 하단 저장 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    elevation: 5,
    paddingBottom: 30,
  },
  saveButton: {
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
});
