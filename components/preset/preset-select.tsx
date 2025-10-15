import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { presetService } from "@/services/preset-service";
import { useAuth } from "@/contexts/AuthContext";
import { extractIndicatorCategories } from "@/utils/parseConditions";
import Benjamin from "../../assets/images/preset/benjamin.svg";
import Charlie from "../../assets/images/preset/charlie.svg";
import GoldenCross from "../../assets/images/preset/goldencross.svg";
import Jesse from "../../assets/images/preset/jesse.svg";
import Mark from "../../assets/images/preset/mark.svg";
import Peter from "../../assets/images/preset/peter.svg";
import Warren from "../../assets/images/preset/warren.svg";

const imageMap: { [key: string]: any } = {
  "워렌 버핏": Warren,
  "벤저민 그레이엄": Benjamin,
  "찰리 멍거": Charlie,
  "피터 린치": Peter,
  "추세 추종": GoldenCross,
  "제시 리버모어": Jesse,
  "마크 미너비니": Mark,
};

// 추천 프리셋과 유명인 프리셋에 대한 지표 설명
const descMap: { [key: string]: string } = {
  "추세 추종": "사용 지표: 50일 이동평균선(SMA), 200일 이동평균선(SMA)",
  "모멘텀 돌파": "사용 지표: 52주 최고가, 거래량, RSI",
  "과매도 반등": "사용 지표: RSI, 볼린저 밴드",
  "추세 전환 경계": "사용 지표: 볼린저 밴드, 데드크로스",
  "리스크 관리": "사용 지표: 추적 손절매",
  "이상 거래량 포착": "사용 지표: 일간 등락률, 거래량",
  "워렌 버핏": "사용 지표: 목표가, 52주 최저가, RSI",
  "벤저민 그레이엄": "사용 지표: 목표가, 52주 최저가, 거래량",
  "찰리 멍거": "사용 지표: 목표가, RSI",
  "피터 린치": "사용 지표: 52주 최고가, 거래량, RSI",
  "폴 튜더 존스": "사용 지표: 일간 등락률, 52주 최저가",
  "마이클 버리": "사용 지표: 52주 최저가, 거래량, 볼린저 밴드",
};

interface Preset {
  presetId: number;
  title: string;
  category: string;
  conditions: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40 * 2 - 14) / 2;

export default function PresetSelect({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<"내" | "유명인" | "추천">("유명인");
  const [presets, setPresets] = useState<Preset[]>([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchPresets = async () => {
      if (!accessToken) {
        console.log("[프리셋] accessToken이 없습니다.");
        return;
      }

      try {
        console.log("[프리셋] API 요청 시작");
        const response = await presetService.getPresetList(accessToken);
        console.log("[프리셋] API 응답 결과:", response);

        if (response.data) {
          const categoryCount = response.data.reduce(
            (acc: any, preset: Preset) => {
              acc[preset.category] = (acc[preset.category] || 0) + 1;
              return acc;
            },
            {}
          );

          setPresets(response.data);
        }
      } catch (error) {
        console.error("[프리셋] API 요청 실패:", error);
      }
    };

    fetchPresets();
  }, [accessToken]);

  const categoryMap: { [key: string]: string } = {
    내: "custom",
    유명인: "influencer",
    추천: "recommended",
  };

  const currentList = presets
    .filter((preset) => {
      const matches = preset.category === categoryMap[category];
      return matches;
    })
    .map((preset) => {
      // custom 카테고리는 동적으로 지표 추출, 나머지는 하드코딩된 설명 사용
      const desc =
        preset.category === "custom"
          ? extractIndicatorCategories(preset.conditions)
          : descMap[preset.title] || `조건 ${preset.conditions.length}개`;

      return {
        id: preset.presetId,
        name: preset.title,
        desc: desc,
        image: imageMap[preset.title] || GoldenCross,
      };
    });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(["내", "유명인", "추천"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, category === tab && styles.activeTab]}
            onPress={() => setCategory(tab)}
          >
            <Text
              style={[styles.tabText, category === tab && styles.activeTabText]}
            >
              {tab} 프리셋
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {currentList.map((p) => (
            <TouchableOpacity key={p.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <p.image width={70} height={70} />
              </View>

              <View style={styles.textCenter}>
                <Text style={styles.name}>{p.name}</Text>
              </View>

              <Text style={styles.desc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>닫기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: "80%",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#000" },
  tabText: { fontSize: 13, color: "#555" },
  activeTabText: { color: "#fff" },
  scrollContent: {
    paddingBottom: 20,
    alignItems: "center",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
    position: "relative",
  },
  imageContainer: {
    position: "absolute",
    right: 10,
    top: 8,
    opacity: 0.9,
  },
  textCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  desc: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },
  closeBtn: {
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  closeText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
