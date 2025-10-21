import ConditionSection from "@/components/condition/condition-section";
import { VOLUME_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import React, { useEffect, useState } from "react";
import {
    LayoutAnimation,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function VolumeConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: any) => void;
  initialValue?: {
    avgRise?: string | null;
    avgDrop?: string | null;
    spike?: boolean;
    drop?: boolean;
  } | null;
}) {
  const [toggles, setToggles] = useState({
    avgRise: false,
    avgDrop: false,
    spike: false,
    drop: false,
  });

  const [avgRiseValue, setAvgRiseValue] = useState("");
  const [avgDropValue, setAvgDropValue] = useState("");

  useEffect(() => {
    if (initialValue) {
      setToggles({
        avgRise: !!initialValue.avgRise,
        avgDrop: !!initialValue.avgDrop,
        spike: !!initialValue.spike,
        drop: !!initialValue.drop,
      });
      setAvgRiseValue(initialValue.avgRise || "");
      setAvgDropValue(initialValue.avgDrop || "");
    }
  }, [initialValue]);

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmPress = () => {
    onConfirm({
      avgRise:
        toggles.avgRise && String(avgRiseValue).trim() !== ""
          ? avgRiseValue
          : null,
      avgDrop:
        toggles.avgDrop && String(avgDropValue).trim() !== ""
          ? avgDropValue
          : null,
      spike: toggles.spike,
      drop: toggles.drop,
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>거래량 설정</Text>
        <Text style={styles.sectionSubtitle}>
          평균 거래량 대비 변화 조건을 설정하세요
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.container}>

        {/* 평균 거래량 대비 상승 */}
        <ConditionSection
          title="평균 거래량 대비 상승"
          description={VOLUME_SECTION_DESCRIPTIONS.AVG_CHANGE}
          value={toggles.avgRise}
          onToggle={() => toggle("avgRise")}
          rows={[{}]}
          hasFilled={String(avgRiseValue).trim() !== ""}
          onAdd={() => {}}
          renderRow={() =>
            toggles.avgRise && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="상승 비율을 입력해주세요 (%)"
                  keyboardType="numeric"
                  value={avgRiseValue}
                  onChangeText={setAvgRiseValue}
                />
                <Text style={styles.unit}>%</Text>
              </View>
            )
          }
        />

        {/* 평균 거래량 대비 하락 */}
        <ConditionSection
          title="평균 거래량 대비 하락"
          description={VOLUME_SECTION_DESCRIPTIONS.AVG_CHANGE}
          value={toggles.avgDrop}
          onToggle={() => toggle("avgDrop")}
          rows={[{}]}
          hasFilled={String(avgDropValue).trim() !== ""}
          onAdd={() => {}}
          renderRow={() =>
            toggles.avgDrop && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="하락 비율을 입력해주세요 (%)"
                  keyboardType="numeric"
                  value={avgDropValue}
                  onChangeText={setAvgDropValue}
                />
                <Text style={styles.unit}>%</Text>
              </View>
            )
          }
        />

        {/* 거래량 급증 경고 */}
        <ConditionSection
          title="거래량 급증 경고"
          description={VOLUME_SECTION_DESCRIPTIONS.SPIKE}
          value={toggles.spike}
          onToggle={() => toggle("spike")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        {/* 거래량 감소 경고 */}
        <ConditionSection
          title="거래량 감소 경고"
          description={VOLUME_SECTION_DESCRIPTIONS.DROP}
          value={toggles.drop}
          onToggle={() => toggle("drop")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setToggles({
              avgRise: false,
              avgDrop: false,
              spike: false,
              drop: false,
            });
            setAvgRiseValue("");
            setAvgDropValue("");
          }}
        >
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPress}
        >
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#111",
    marginBottom: 6,
    fontFamily: "Pretendard",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
    fontFamily: "Pretendard",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  container: { 
    paddingHorizontal: 20, 
    paddingVertical: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
    fontFamily: "Pretendard",
  },
  unit: { 
    marginLeft: 10, 
    fontSize: 14, 
    color: "#666",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  resetButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#FAFAFA",
  },
  resetText: { 
    fontSize: 15, 
    color: "#333", 
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: { 
    fontSize: 15, 
    color: "#fff", 
    fontWeight: "700",
    fontFamily: "Pretendard",
  },
});
