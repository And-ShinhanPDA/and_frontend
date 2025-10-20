import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BollingerBandConditionReadonly from "@/components/add-card/bollingerband/bollingerband-condition-readonly";
import ChangeConditionReadonlyCard from "@/components/add-card/change/change-condition-readonly";
import PriceConditionReadonlyCard from "@/components/add-card/price/price-condition-readonly";
import RSIConditionReadonlyCard from "@/components/add-card/rsi/rsi-condition-readonly";
import SMAConditionReadonlyCard from "@/components/add-card/sma/sma-condition-readonly";
import TrailingConditionReadonlyCard from "@/components/add-card/trailing/trailing-condition-readonly";
import VolumeConditionReadonlyCard from "@/components/add-card/volume/volume-condition-readonly";
import Week52ConditionReadonlyCard from "@/components/add-card/week52/week52-condition-readonly";
import CustomHeader from "@/components/header/header";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { presetService } from "@/services/preset-service";
import { parseConditionsForCards } from "@/utils/parseConditions";

// 프리셋 설명 맵
const PRESET_DESCRIPTIONS: { [key: string]: string } = {
  "워렌 버핏":
    "이 프리셋은 가치투자의 대가 워렌 버핏의 투자 철학을 반영한 전략입니다. 저평가된 우량주를 발굴하고 장기 보유하는 것을 목표로 합니다.",
  "벤저민 그레이엄":
    "이 프리셋은 가치투자의 아버지 벤저민 그레이엄의 안전마진 원칙을 적용한 전략입니다. 내재가치 대비 저평가된 종목을 찾는 데 중점을 둡니다.",
  "찰리 멍거":
    "이 프리셋은 워렌 버핏의 파트너 찰리 멍거의 투자 원칙을 반영한 전략입니다. 우수한 기업을 합리적인 가격에 매수하는 것을 목표로 합니다.",
  "피터 린치":
    "이 프리셋은 성장주 투자의 대가 피터 린치의 전략을 적용합니다. 일상에서 발견한 성장 가능성 높은 기업에 투자하는 것을 목표로 합니다.",
  "제시 리버모어":
    "이 프리셋은 전설적인 트레이더 제시 리버모어의 단기 매매 전략을 반영합니다. 시장의 추세를 빠르게 포착하여 수익을 실현하는 것을 목표로 합니다.",
  "마크 미너비니":
    "이 프리셋은 챔피언 트레이더 마크 미너비니의 모멘텀 전략을 적용합니다. 강한 상승 추세의 종목을 선별하여 투자하는 것을 목표로 합니다.",
  "추세 추종":
    "이 프리셋은 이동평균선을 활용한 추세 추종 전략입니다. 장기적인 상승 추세를 포착하여 안정적인 수익을 추구합니다.",
  "모멘텀 돌파":
    "이 프리셋은 강한 상승 모멘텀을 포착하는 전략입니다. 52주 신고가 돌파와 거래량 급증을 활용하여 급등주를 발굴합니다.",
  "과매도 반등":
    "이 프리셋은 과매도 구간에서의 반등을 노리는 전략입니다. RSI와 볼린저 밴드를 활용하여 저점 매수 기회를 포착합니다.",
  "추세 전환 경계":
    "이 프리셋은 추세 전환 시점을 감지하는 전략입니다. 데드크로스와 볼린저 밴드를 통해 하락 추세 전환을 조기에 경고합니다.",
  "리스크 관리":
    "이 프리셋은 손실을 최소화하는 전략입니다. 추적 손절매를 통해 수익을 지키고 손실을 제한하는 것을 목표로 합니다.",
  "이상 거래량 포착":
    "이 프리셋은 비정상적인 거래량 변화를 감지하는 전략입니다. 급격한 가격 변동과 거래량 급증을 통해 기회를 포착합니다.",
};

export default function PresetDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { accessToken } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [loading, setLoading] = useState(true);
  const [presetData, setPresetData] = useState<any>(null);

  // 프리셋 상세 조회
  useEffect(() => {
    const fetchPresetDetail = async () => {
      if (!accessToken || !id) return;

      try {
        setLoading(true);
        // TODO: API 연결 필요
        // const response = await presetService.getPresetDetail(accessToken, String(id));

        // 임시로 프리셋 목록에서 찾기
        const response = await presetService.getPresetList(accessToken);
        console.log("프리셋 목록 조회 응답:", response);

        if (response?.data) {
          const preset = response.data.find(
            (p: any) => p.presetId === Number(id)
          );
          if (preset) {
            setPresetData(preset);
          } else {
            showAlert({
              message: "프리셋을 찾을 수 없습니다.",
              buttons: [{ text: "확인", onPress: () => router.back() }],
            });
          }
        }
      } catch (error) {
        console.error("프리셋 조회 실패:", error);
        showAlert({
          message: "프리셋 정보를 불러오는데 실패했습니다.",
          buttons: [{ text: "확인", onPress: () => router.back() }],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPresetDetail();
  }, [id, accessToken]);

  // 파싱된 조건 데이터
  const parsedConditions = presetData?.conditions
    ? parseConditionsForCards(presetData.conditions)
    : null;

  // 디버깅: 파싱 결과 확인
  useEffect(() => {
    if (parsedConditions) {
      console.log("=== 파싱된 조건들 ===");
      console.log("price:", parsedConditions.price);
      console.log("change:", parsedConditions.change);
      console.log("trailing:", parsedConditions.trailing);
      console.log("week52:", parsedConditions.week52);
      console.log("volume:", parsedConditions.volume);
      console.log("sma:", parsedConditions.sma);
      console.log("rsi:", parsedConditions.rsi);
      console.log("bollinger:", parsedConditions.bollinger);
    }
  }, [parsedConditions]);

  // 프리셋 삭제 (내 프리셋만)
  const handleDelete = () => {
    if (presetData?.category !== "custom") {
      showAlert({
        message: "내 프리셋만 삭제할 수 있습니다.",
        buttons: [{ text: "확인" }],
      });
      return;
    }

    showAlert({
      title: "프리셋 삭제",
      message: `"${presetData.title}" 프리셋을 삭제하시겠습니까?`,
      buttons: [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            if (!accessToken) return;

            try {
              console.log("[프리셋 삭제 요청]:", id);
              await presetService.deletePreset(accessToken, String(id));
              console.log("[프리셋 삭제 성공]:", id);
              showAlert({
                message: "프리셋이 삭제되었습니다.",
                buttons: [{ text: "확인", onPress: () => router.back() }],
              });
            } catch (error) {
              console.error("[프리셋 삭제 실패]:", error);
              showAlert({
                message: "프리셋 삭제에 실패했습니다.",
                buttons: [{ text: "확인" }],
              });
            }
          },
        },
      ],
    });
  };

  // 프리셋 수정 (내 프리셋만)
  const handleModify = () => {
    if (presetData?.category !== "custom") {
      showAlert({
        message: "내 프리셋만 수정할 수 있습니다.",
        buttons: [{ text: "확인" }],
      });
      return;
    }

    console.log("[프리셋 수정 화면 이동]:", id);
    router.push(`/(tabs)/(preset-modify)/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CC439" />
        <Text style={styles.loadingText}>프리셋을 불러오는 중...</Text>
      </View>
    );
  }

  if (!presetData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>프리셋을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const isCustomPreset = presetData.category === "custom";

  return (
    <View style={styles.container}>
      <CustomHeader
        title={presetData.title || "프리셋 조회"}
        showBackButton={true}
        rightButtons={isCustomPreset ? "modify" : undefined}
        onModifyPress={isCustomPreset ? handleModify : undefined}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프리셋 정보 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{presetData.title}</Text>
          <Text style={styles.infoCategory}>
            {presetData.category === "custom"
              ? "내 프리셋"
              : presetData.category === "influencer"
              ? "유명인 프리셋"
              : "추천 프리셋"}
          </Text>
          <Text style={styles.infoConditionCount}>
            조건 {presetData.conditions?.length || 0}개
          </Text>
        </View>

        {/* 프리셋 설명 (유명인/추천 프리셋만) */}
        {!isCustomPreset && PRESET_DESCRIPTIONS[presetData.title] && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>프리셋 설명</Text>
            <Text style={styles.descriptionContent}>
              {PRESET_DESCRIPTIONS[presetData.title]}
            </Text>
          </View>
        )}

        {/* 프리셋 적용 안내 */}
        <View style={styles.applyNoticeContainer}>
          <View style={styles.applyNoticeIcon}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 50, height: 50 }}
            />
          </View>
          <Text style={styles.applyNoticeText}>
            알림을 추가/수정할 때 아래 지표를 적용할 수 있습니다!
          </Text>
        </View>

        <View style={styles.divider} />

        {/* 조건 카드들 */}
        {parsedConditions?.price && (
          <PriceConditionReadonlyCard conditionData={parsedConditions.price} />
        )}
        {parsedConditions?.change && (
          <ChangeConditionReadonlyCard
            conditionData={parsedConditions.change}
          />
        )}
        {parsedConditions?.trailing && (
          <TrailingConditionReadonlyCard
            conditionData={parsedConditions.trailing}
          />
        )}
        {parsedConditions?.week52 && (
          <Week52ConditionReadonlyCard
            conditionData={parsedConditions.week52}
          />
        )}
        {parsedConditions?.volume && (
          <VolumeConditionReadonlyCard
            conditionData={parsedConditions.volume}
          />
        )}
        {parsedConditions?.sma && (
          <SMAConditionReadonlyCard conditionData={parsedConditions.sma} />
        )}
        {parsedConditions?.rsi && (
          <RSIConditionReadonlyCard conditionData={parsedConditions.rsi} />
        )}
        {parsedConditions?.bollinger && (
          <BollingerBandConditionReadonly
            conditionData={parsedConditions.bollinger}
          />
        )}
      </ScrollView>

      {/* 하단 삭제 버튼 (내 프리셋만) */}
      {isCustomPreset && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>프리셋 삭제</Text>
          </TouchableOpacity>
        </View>
      )}

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: "#F5F6F8",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    fontFamily: "Pretendard",
  },
  infoCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontFamily: "Pretendard",
  },
  infoConditionCount: {
    fontSize: 14,
    color: "#4CC439",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 16,
  },
  descriptionContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginVertical: 12,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 10,
    fontFamily: "Pretendard",
  },
  descriptionContent: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    fontFamily: "Pretendard",
  },
  applyNoticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 12,
  },
  applyNoticeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor: "#4CC439",
    justifyContent: "center",
    alignItems: "center",
  },
  applyNoticeIconText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
  applyNoticeText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    fontFamily: "Pretendard",
    fontWeight: "600",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingBottom: 32,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Pretendard",
  },
});
