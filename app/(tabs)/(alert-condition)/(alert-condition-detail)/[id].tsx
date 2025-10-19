import { CustomBottomTab } from "@/components/bottom/bottom";
import BollingerBandConditionReadonly from "@/components/add-card/bollingerband/bollingerband-condition-readonly";
import RSIConditionReadonlyCard from "@/components/add-card/rsi/rsi-condition-readonly";
import SMAConditionReadonlyCard from "@/components/add-card/sma/sma-condition-readonly";
import VolumeConditionReadonlyCard from "@/components/add-card/volume/volume-condition-readonly";
import Week52ConditionReadonlyCard from "@/components/add-card/week52/week52-condition-readonly";
import CustomHeader from "@/components/header/header";
import ConditionBottomSheet from "@/components/modals/condition-bottom-sheet";
import PresetSelect from "@/components/preset/preset-select";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { alertService } from "@/services/alert-service";
import { presetService } from "@/services/preset-service";
import { parseConditionsForCards } from "@/utils/parseConditions";

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
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState<any>(null);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const tabs = ["제목", "52주", "거래량", "SMA", "RSI", "볼린저 밴드"];

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
  const fetchAlertDetail = useCallback(async () => {
    if (!accessToken || !id) return;

    try {
      setLoading(true);
      const response = await alertService.getAlertDetail(
        accessToken,
        String(id)
      );
      console.log("조건 알림 상세 조회 응답:", response);

      if (response?.data) {
        setAlertData(response.data);
        setTitle(response.data.title || "");
      }
    } catch (error) {
      console.error("조건 알림 상세 조회 실패:", error);
      alert("조건 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, accessToken]);

  useEffect(() => {
    fetchAlertDetail();
  }, [fetchAlertDetail]);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchAlertDetail();
    }, [fetchAlertDetail])
  );

  // 파싱된 조건 데이터
  const parsedConditions = alertData?.conditions
    ? parseConditionsForCards(alertData.conditions)
    : null;

  const handlePresetAdd = () => {
    Alert.alert("프리셋 추가", "이 조건을 프리셋으로 추가하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "추가",
        onPress: async () => {
          if (!accessToken || !alertData) return;

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

            Alert.alert("성공", "프리셋이 추가되었습니다.");
          } catch (error) {
            console.error("[프리셋 추가 실패]:", error);
            Alert.alert("실패", "프리셋 추가에 실패했습니다.");
          }
        },
      },
    ]);
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
        {/* 제목 (읽기 전용) */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleLabel}>알림 제목</Text>
          <Text style={styles.titleValue}>{title}</Text>
        </View>

        <View style={styles.divider} />

        {/* 조건 카드 - 읽기 전용 */}
        <Week52ConditionReadonlyCard conditionData={parsedConditions?.week52} />

        <VolumeConditionReadonlyCard conditionData={parsedConditions?.volume} />
        <SMAConditionReadonlyCard conditionData={parsedConditions?.sma} />

        <RSIConditionReadonlyCard conditionData={parsedConditions?.rsi} />
        <BollingerBandConditionReadonly
          conditionData={parsedConditions?.bollinger}
        />
      </ScrollView>

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
    marginTop: 10,
    marginBottom: 10,
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

  titleContainer: {
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  titleLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  titleValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
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
});
