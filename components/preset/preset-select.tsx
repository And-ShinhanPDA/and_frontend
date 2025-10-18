import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Animated,
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

interface PresetSelectProps {
  onClose: () => void;
  mode?: "view" | "select"; // view: 조회/관리 모드, select: 선택/적용 모드
  onPresetSelect?: (presetId: number, conditions: any[]) => void; // select 모드일 때 사용
}

export default function PresetSelect({
  onClose,
  mode = "view",
  onPresetSelect,
}: PresetSelectProps) {
  const [category, setCategory] = useState<"내" | "유명인" | "추천">("유명인");
  const [presets, setPresets] = useState<Preset[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const shakeAnimations = useRef<{ [key: number]: Animated.Value }>({});
  const fadeAnimations = useRef<{ [key: number]: Animated.Value }>({});
  const scaleAnimations = useRef<{ [key: number]: Animated.Value }>({});
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

  const startShake = (id: number) => {
    if (!shakeAnimations.current[id]) {
      shakeAnimations.current[id] = new Animated.Value(0);
    }
    if (!fadeAnimations.current[id]) {
      fadeAnimations.current[id] = new Animated.Value(0);
    }
    if (!scaleAnimations.current[id]) {
      scaleAnimations.current[id] = new Animated.Value(1);
    }

    const singleShake = Animated.sequence([
      Animated.timing(shakeAnimations.current[id], {
        toValue: 0.5,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimations.current[id], {
        toValue: -0.5,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimations.current[id], {
        toValue: 0.5,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimations.current[id], {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(singleShake, { iterations: 4 }).start();

    Animated.parallel([
      Animated.timing(fadeAnimations.current[id], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimations.current[id], {
        toValue: 1.02,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 흔들림 애니메이션 정지
  const stopShake = (id: number) => {
    if (shakeAnimations.current[id]) {
      shakeAnimations.current[id].stopAnimation();
      shakeAnimations.current[id].setValue(0);
    }
    if (fadeAnimations.current[id]) {
      Animated.timing(fadeAnimations.current[id], {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    if (scaleAnimations.current[id]) {
      Animated.spring(scaleAnimations.current[id], {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  // 긴 눌림 핸들러 (view 모드 + 내 프리셋만)
  const handleLongPress = (id: number) => {
    if (mode === "view" && category === "내") {
      setEditMode((prev) => ({ ...prev, [id]: true }));
      startShake(id);
    }
  };

  // 편집 모드 해제
  const handleCancelEdit = (id: number) => {
    setEditMode((prev) => ({ ...prev, [id]: false }));
    stopShake(id);
  };

  // 프리셋 삭제
  const handleDelete = async (id: number) => {
    if (!accessToken) return;

    try {
      console.log("프리셋 삭제:", id);
      // TODO: API 연결
      // await presetService.deletePreset(accessToken, id);

      // 삭제 후 목록 새로고침
      setPresets((prev) => prev.filter((p) => p.presetId !== id));
      handleCancelEdit(id);
    } catch (error) {
      console.error("프리셋 삭제 실패:", error);
    }
  };

  // 일반 클릭 핸들러
  const handlePress = (id: number) => {
    // 편집 모드일 때는 동작 안함
    if (editMode[id]) return;

    const selectedPreset = presets.find((p) => p.presetId === id);
    if (!selectedPreset) return;

    if (mode === "select") {
      // select 모드: 프리셋 적용 확인
      Alert.alert(
        "프리셋 적용",
        `"${selectedPreset.title}" 프리셋을 적용하시겠습니까?\n현재 입력된 조건은 사라집니다.`,
        [
          {
            text: "아니오",
            style: "cancel",
          },
          {
            text: "예",
            onPress: () => {
              console.log("프리셋 적용:", id, selectedPreset.conditions);
              if (onPresetSelect) {
                onPresetSelect(id, selectedPreset.conditions);
              }
              onClose(); // 선택 후 모달 닫기
            },
          },
        ]
      );
    } else {
      // view 모드: 세부사항 보기 (TODO: 라우터로 이동)
      console.log("프리셋 세부사항 보기:", id);
      // TODO: router.push로 세부사항 화면 이동
    }
  };

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
          {currentList.map((p) => {
            // 애니메이션 값 초기화
            if (!shakeAnimations.current[p.id]) {
              shakeAnimations.current[p.id] = new Animated.Value(0);
            }
            if (!fadeAnimations.current[p.id]) {
              fadeAnimations.current[p.id] = new Animated.Value(0);
            }
            if (!scaleAnimations.current[p.id]) {
              scaleAnimations.current[p.id] = new Animated.Value(1);
            }

            const rotation = shakeAnimations.current[p.id].interpolate({
              inputRange: [-1, 1],
              outputRange: ["-1.5deg", "1.5deg"],
            });

            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.card,
                  {
                    transform: [
                      { rotate: rotation },
                      { scale: scaleAnimations.current[p.id] },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => handlePress(p.id)}
                  onLongPress={() => handleLongPress(p.id)}
                  delayLongPress={400}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageContainer}>
                    <p.image width={70} height={70} />
                  </View>

                  <View style={styles.textCenter}>
                    <Text style={styles.name}>{p.name}</Text>
                  </View>

                  <Text style={styles.desc}>{p.desc}</Text>
                </TouchableOpacity>

                {/* 삭제 버튼 - view 모드 + 편집 모드일 때만 표시 */}
                {mode === "view" && editMode[p.id] && (
                  <Animated.View
                    style={[
                      styles.deleteButton,
                      { opacity: fadeAnimations.current[p.id] },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.deleteButtonInner}
                      onPress={() => handleDelete(p.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>
          {mode === "select" ? "취소" : "닫기"}
        </Text>
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
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  cardTouchable: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    width: "100%",
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
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  deleteButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CC439",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
});
