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
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { alertService } from "@/services/alert-service";
import { refreshWidgetManually } from "@/services/widgetShare";
import { parseConditionsForCards } from "@/utils/parseConditions";

export default function ConditionAlertDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const tabs = ["제목", "가격", "52주", "거래량", "SMA", "RSI", "볼린저 밴드"];
  const { accessToken } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<any>(null);
  const [title, setTitle] = useState("");

  const [conditionGetters, setConditionGetters] = useState<{
    [k: string]: () => any[];
  }>({});

  const handleTempSave = useCallback((id: string, getter: () => any[]) => {
    setConditionGetters((prev) => ({ ...prev, [id]: getter }));
  }, []);

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

  // 파싱된 조건 데이터
  const parsedConditions = useMemo(() => {
    return alertData?.conditions
      ? parseConditionsForCards(alertData.conditions)
      : null;
  }, [alertData?.conditions]);

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

      console.log(
        "📤 [알림 수정] 전송할 payload:",
        JSON.stringify(payload, null, 2)
      );

      const res = await alertService.updateAlert(
        accessToken,
        String(id),
        payload
      );

      console.log("✅ [알림 수정] 성공 - 전체 응답:", res);
      console.log(
        "🤖 [알림 수정] AI 피드백:",
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
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
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
});
