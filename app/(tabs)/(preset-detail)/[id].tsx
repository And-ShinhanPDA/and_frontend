import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
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

        {/* 삭제 버튼 (내 프리셋만) */}
        {isCustomPreset && (
          <View style={styles.deleteButtonContainer}>
            <Text style={styles.deleteButton} onPress={handleDelete}>
              프리셋 삭제
            </Text>
          </View>
        )}
      </ScrollView>

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
  deleteButtonContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  deleteButton: {
    fontSize: 15,
    color: "#FF3B30",
    fontWeight: "600",
    fontFamily: "Pretendard",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});
