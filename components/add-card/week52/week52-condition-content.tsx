import React, { useEffect, useRef, useState } from "react";
import {
    LayoutAnimation,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import ConditionSection from "@/components/condition/condition-section";
import { WEEK52_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
export default function Week52ConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: any) => void;
  initialValue?: any;
}) {
  const [sectionToggles, setSectionToggles] = useState({
    highAlert: false,
    highProximity: false,
    lowAlert: false,
    lowProximity: false,
  });

  const [highProximity, setHighProximity] = useState({ value: "" });
  const [lowProximity, setLowProximity] = useState({ value: "" });

  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current) {
      if (initialValue && Object.keys(initialValue).length > 0) {
        setSectionToggles({
          highAlert: !!initialValue.highAlert,
          highProximity: !!initialValue.highProximity?.value,
          lowAlert: !!initialValue.lowAlert,
          lowProximity: !!initialValue.lowProximity?.value,
        });

        if (initialValue.highProximity?.value) {
          setHighProximity({ value: initialValue.highProximity.value });
        }
        if (initialValue.lowProximity?.value) {
          setLowProximity({ value: initialValue.lowProximity.value });
        }
      }
      inited.current = true;
    }
  }, [initialValue]);

  const toggleSection = (key: keyof typeof sectionToggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleConfirmPress = () => {
    onConfirm({
      highAlert: sectionToggles.highAlert,
      lowAlert: sectionToggles.lowAlert,
      highProximity:
        sectionToggles.highProximity &&
        String(highProximity.value).trim() !== ""
          ? { value: highProximity.value }
          : null,
      lowProximity:
        sectionToggles.lowProximity && String(lowProximity.value).trim() !== ""
          ? { value: lowProximity.value }
          : null,
    });
  };

  const handleReset = () => {
    setSectionToggles({
      highAlert: false,
      highProximity: false,
      lowAlert: false,
      lowProximity: false,
    });
    setHighProximity({ value: "" });
    setLowProximity({ value: "" });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>52주 설정</Text>
        <Text style={styles.sectionSubtitle}>
          52주 최고가/최저가 기준 조건을 설정하세요
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

        {/* 최고가 경보 */}
        <ConditionSection
          title="52주 최고가 경보"
          description={WEEK52_SECTION_DESCRIPTIONS.HIGH_ALERT}
          value={sectionToggles.highAlert}
          onToggle={() => toggleSection("highAlert")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        {/* 최고가 근접 */}
        <ConditionSection
          title="52주 최고가 근접 여부"
          description={WEEK52_SECTION_DESCRIPTIONS.HIGH_PROXIMITY}
          value={sectionToggles.highProximity}
          onToggle={() => toggleSection("highProximity")}
          rows={[{}]}
          hasFilled={String(highProximity.value).trim() !== ""}
          onAdd={() => {}}
          renderRow={() =>
            sectionToggles.highProximity && (
              <View style={styles.rowContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="근접 비율을 입력해주세요"
                  keyboardType="numeric"
                  value={highProximity.value}
                  onChangeText={(v) => setHighProximity({ value: v })}
                />
                <Text style={styles.unit}>%</Text>
              </View>
            )
          }
        />

        {/* 최저가 경보 */}
        <ConditionSection
          title="52주 최저가 경보"
          description={WEEK52_SECTION_DESCRIPTIONS.LOW_ALERT}
          value={sectionToggles.lowAlert}
          onToggle={() => toggleSection("lowAlert")}
          rows={[]}
          hasFilled={false}
          onAdd={() => {}}
          renderRow={() => null}
        />

        {/* 최저가 근접 */}
        <ConditionSection
          title="52주 최저가 근접 여부"
          description={WEEK52_SECTION_DESCRIPTIONS.LOW_PROXIMITY}
          value={sectionToggles.lowProximity}
          onToggle={() => toggleSection("lowProximity")}
          rows={[{}]}
          hasFilled={String(lowProximity.value).trim() !== ""}
          onAdd={() => {}}
          renderRow={() =>
            sectionToggles.lowProximity && (
              <View style={styles.rowContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="근접 비율을 입력해주세요"
                  keyboardType="numeric"
                  value={lowProximity.value}
                  onChangeText={(v) => setLowProximity({ value: v })}
                />
                <Text style={styles.unit}>%</Text>
              </View>
            )
          }
        />
        </View>
      </ScrollView>

      {/* 하단 버튼 - 고정 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
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
  rowContainer: {
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
