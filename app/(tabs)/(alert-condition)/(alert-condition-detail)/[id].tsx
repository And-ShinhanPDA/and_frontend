import BollingerBandConditionReadonly from "@/components/add-card/bollingerband/bollingerband-condition-readonly";
import ChangeConditionReadonlyCard from "@/components/add-card/change/change-condition-readonly";
import RSIConditionReadonlyCard from "@/components/add-card/rsi/rsi-condition-readonly";
import SMAConditionReadonlyCard from "@/components/add-card/sma/sma-condition-readonly";
import VolumeConditionReadonlyCard from "@/components/add-card/volume/volume-condition-readonly";
import Week52ConditionReadonlyCard from "@/components/add-card/week52/week52-condition-readonly";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomAlert } from "@/hooks/use-custom-alert";
import { alertService } from "@/services/alert-service";
import { presetService } from "@/services/preset-service";
import { parseConditionsForCards } from "@/utils/parseConditions";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// TODO: types로 빼기
type AlertCondition = {
  id: string;
  name: string;
  enabled: boolean;
  tags: string[];
};

export default function ConditionAlertDetail() {
  const { id, name, tags } = useLocalSearchParams<{
    id: string;
    name: string;
    tags: string;
  }>();
  const { accessToken, signOut, user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: View | null }>({});
  const tabs = ["변동률", "52주", "거래량", "SMA", "RSI", "볼린저밴드"];

  // 태그 파싱
  const parsedTags = tags ? JSON.parse(tags) : [];

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      console.log("로그아웃 성공");
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 특정 조건 알림 상세 조회
  const fetchAlertDetail = async () => {
    if (!accessToken || !id) return;

    try {
      setLoading(true);
      const response = await alertService.getAlertDetail(
        accessToken,
        String(id)
      );
      console.log("🔄 [조건 알림 상세] 조회 응답:", response);

      if (response?.data) {
        setAlertData(response.data);
        setTitle(response.data.title || "");
        console.log("✅ [조건 알림 상세] 데이터 업데이트 완료");
        console.log("🤖 [AI 피드백]:", response.data.aiFeedback || "(없음)");
      }
    } catch (error) {
      console.error("❌ [조건 알림 상세] 조회 실패:", error);
      showAlert({
        message: "조건 정보를 불러오는데 실패했습니다.",
        buttons: [{ text: "확인" }],
      });
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log(
        "🎯 [useFocusEffect] 조건 알림 상세 화면 포커스 - 데이터 새로고침"
      );
      fetchAlertDetail();
    }, [accessToken, id])
  );

  // 파싱된 조건 데이터
  const parsedConditions = alertData?.conditions
    ? parseConditionsForCards(alertData.conditions)
    : null;

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

  const handlePresetAdd = () => {
    showAlert({
      title: "프리셋 추가",
      message: "이 조건을 프리셋으로 추가하시겠습니까?",
      buttons: [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "추가",
          onPress: async () => {
            if (!accessToken || !alertData) return;

            setSaving(true);
            try {
              const payload = {
                title: alertData.title,
                conditions: alertData.conditions,
                category: "custom", // 사용자 프리셋으로 추가
              };

              console.log("[프리셋 추가] payload:", payload);
              const response = await presetService.createPreset(
                accessToken,
                payload
              );
              console.log("[프리셋 추가 성공]:", response);
              setSaving(false);

              showAlert({
                title: "성공",
                message: "프리셋이 추가되었습니다.",
                buttons: [{ text: "확인" }],
              });
            } catch (error) {
              console.error("[프리셋 추가 실패]:", error);
              setSaving(false);
              showAlert({
                title: "실패",
                message: "프리셋 추가에 실패했습니다.",
                buttons: [{ text: "확인" }],
              });
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CC439" />
        <Text style={styles.loadingText}>알림 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!alertData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>알림 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 로딩 오버레이 */}
      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CC439" />
          <Text style={styles.savingText}>처리 중...</Text>
        </View>
      )}

      {/* 헤더 */}
      <CustomHeader
        title={alertData.title || "조건 상세"}
        showBackButton={true}
        rightButtons="preset-and-modify"
        onPresetPress={handlePresetAdd}
        onModifyPress={() =>
          router.push({
            pathname: "/(tabs)/(alert-condition)/(alert-condition-modify)/[id]",
            params: { id: id },
          })
        }
      />

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
      >
        {/* AI 리포트 */}
        {alertData?.aiFeedback && (
          <View style={styles.aiReportContainer}>
            <Text style={styles.aiReportTitle}>AI 리포트</Text>
            <Text style={styles.aiReportContent}>{alertData.aiFeedback}</Text>
          </View>
        )}

        {/* 제목 (읽기 전용) */}
        <View
          ref={(ref) => (sectionRefs.current["title"] = ref)}
          collapsable={false}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.titleLabel}>알림 제목</Text>
            <Text style={styles.titleValue}>{title}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 조건 카드 - 읽기 전용 */}
        <View
          ref={(ref) => (sectionRefs.current["change"] = ref)}
          collapsable={false}
        >
          <ChangeConditionReadonlyCard
            conditionData={parsedConditions?.change}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["week52"] = ref)}
          collapsable={false}
        >
          <Week52ConditionReadonlyCard
            conditionData={parsedConditions?.week52}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["volume"] = ref)}
          collapsable={false}
        >
          <VolumeConditionReadonlyCard
            conditionData={parsedConditions?.volume}
          />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["sma"] = ref)}
          collapsable={false}
        >
          <SMAConditionReadonlyCard conditionData={parsedConditions?.sma} />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["rsi"] = ref)}
          collapsable={false}
        >
          <RSIConditionReadonlyCard conditionData={parsedConditions?.rsi} />
        </View>

        <View
          ref={(ref) => (sectionRefs.current["bollingerband"] = ref)}
          collapsable={false}
        >
          <BollingerBandConditionReadonly
            conditionData={parsedConditions?.bollinger}
          />
        </View>
      </ScrollView>

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

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#666",
  },

  errorText: {
    fontSize: 15,
    color: "#FF3B30",
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

  aiReportContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginVertical: 12,
  },
  aiReportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 10,
    fontFamily: "Pretendard",
  },
  aiReportContent: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    fontFamily: "Pretendard",
  },
  titleContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  titleLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "Pretendard",
  },
  titleValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
    fontFamily: "Pretendard",
    lineHeight: 22,
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
    paddingBottom: 30,
    paddingTop: 4,
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
  savingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
