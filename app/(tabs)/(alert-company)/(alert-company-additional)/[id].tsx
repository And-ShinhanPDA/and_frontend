import BollingerBandCondition from "@/components/add-card/bollingerband/bollingerband-condition";
import ChangeConditionCard from "@/components/add-card/change/change-condition";
import CurrentStatusCard from "@/components/add-card/current-status";
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
import { alertService } from "@/services/alert-service";
import { presetService } from "@/services/preset-service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CompanyAlertDetail() {
  const { accessToken } = useAuth();
  const { id, name } = useLocalSearchParams();
  const router = useRouter();
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const tabs = [
    "제목",
    "가격",
    "후행",
    "52주",
    "거래량",
    "SMA",
    "RSI",
    "볼린저밴드",
  ];

  const [title, setTitle] = useState("");
  const [conditions, setConditions] = useState<any[]>([]);

  const [conditionGetters, setConditionGetters] = useState<{
    [k: string]: () => any[];
  }>({});

  const handleTempSave = useCallback((id: string, getter: () => any[]) => {
    setConditionGetters((prev) => ({ ...prev, [id]: getter }));
  }, []);

  const handleSave = async () => {
    try {
      if (!accessToken) {
        alert("로그인이 필요합니다.");
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
        stockCode: String(id) || "005930",
        title: title || `${name}`,
        isActive: true,
        isPreset: false,
        conditions: mergedConditions,
      };

      const res = await alertService.createAlert(payload, accessToken);
      console.log("알림 등록 성공:", res);

      // 프리셋 등록 여부 확인
      Alert.alert("프리셋 등록", "프리셋으로도 등록하시겠습니까?", [
        {
          text: "아니오",
          style: "cancel",
          onPress: () => {
            alert("알림이 성공적으로 등록되었습니다!");
            // 기업 상세 페이지로 이동
            router.replace({
              pathname: "/(tabs)/(alert-company)/(alert-company-detail)/[id]",
              params: { id: String(id), name: String(name) },
            });
          },
        },
        {
          text: "네",
          onPress: async () => {
            try {
              // 프리셋으로 저장
              const presetPayload = {
                title: title || `${name} 조건`,
                conditions: mergedConditions,
                category: "custom",
              };

              console.log("[프리셋 추가] payload:", presetPayload);
              await presetService.createPreset(accessToken, presetPayload);
              console.log("[프리셋 추가 성공]");

              alert("알림과 프리셋이 모두 등록되었습니다!");
            } catch (presetError) {
              console.error("[프리셋 추가 실패]:", presetError);
              alert("알림은 등록되었으나 프리셋 등록에 실패했습니다.");
            } finally {
              // 기업 상세 페이지로 이동
              router.replace({
                pathname: "/(tabs)/(alert-company)/(alert-company-detail)/[id]",
                params: { id: String(id), name: String(name) },
              });
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error("알림 등록 실패:", error);
      if (error.response?.status === 401) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인 해주세요.");
      } else {
        alert("알림 등록 중 오류가 발생했습니다.");
      }
    }
  };

  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.container}>
      <CustomHeader title={`${name}`} showBackButton={true} />

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
        <CurrentStatusCard
          time="11:38 기준"
          currentPrice={50000}
          openPrice={50000}
          high52w={55000}
          low52w={45000}
          volume={50}
          bollingerUpper={50000}
          bollingerLower={50000}
          rsi={50}
          sma={{
            "5일": 50000,
            "10일": 50100,
            "20일": 50200,
            "30일": 50300,
            "50일": 50400,
            "100일": 50500,
            "200일": 50600,
          }}
        />
        <View style={styles.divider} />
        <TextInput
          style={styles.titleInput}
          placeholder="이 조건을 대표할 수 있는 한 줄 제목"
          placeholderTextColor="#A4A4A4"
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.divider} />
        <PriceConditionCard onTempSave={handleTempSave} />
        <ChangeConditionCard onTempSave={handleTempSave} />
        <TrailingConditionCard onTempSave={handleTempSave} />
        <Week52ConditionCard onTempSave={handleTempSave} />

        <VolumeConditionCard onTempSave={handleTempSave} />
        <SMAConditionCard onTempSave={handleTempSave} />

        <RSIConditionCard onTempSave={handleTempSave} />
        <BollingerBandCondition onTempSave={handleTempSave} />
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

  divider: {
    height: 7,
    backgroundColor: "#F5F6F8",
    marginVertical: 10,
    marginHorizontal: -16,
    width: "100%",
    alignSelf: "stretch",
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
