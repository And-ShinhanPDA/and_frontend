import ConditionInput from "@/components/condition/condition-input";
import ConditionSection from "@/components/condition/condition-section";
import React, { useEffect, useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type TrailingConditionData = {
  stopPrice: string;
  stopPercent: string;
  buyPrice: string;
  buyPercent: string;
};

export default function TrailingConditionContent({
  onConfirm,
  initialValue,
}: {
  onConfirm: (data: TrailingConditionData) => void;
  initialValue?: TrailingConditionData | null;
}) {
  const [values, setValues] = useState<TrailingConditionData>({
    stopPrice: "",
    stopPercent: "",
    buyPrice: "",
    buyPercent: "",
  });

  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    if (initialValue) setValues(initialValue);
    inited.current = true;
  }, [initialValue]);

  const handleConfirm = () => {
    onConfirm(values);
  };

  const handleReset = () => {
    setValues({
      stopPrice: "",
      stopPercent: "",
      buyPrice: "",
      buyPercent: "",
    });
  };

  const handleChange = (key: keyof TrailingConditionData, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>후행 조건 설정</Text>
        <Text style={styles.sectionSubtitle}>
          추적 손절매 및 추적 매수 조건을 설정하세요
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

        {/* 추적 손절매 */}
        <ConditionSection
          title="추적 손절매 (하락)"
          description="최근 고가 대비 일정 하락 금액 또는 비율 시 알림"
          value={true}
          onAdd={() => {}}
          onToggle={() => {}}
          rows={[{ id: 1 }]}
          hasFilled={
            String(values.stopPrice).trim() !== "" ||
            String(values.stopPercent).trim() !== ""
          }
          renderRow={() => (
            <View>
              <View style={styles.rowContainer}>
                <Text style={[styles.compareBadge, styles.minusBadge]}>-</Text>
                <ConditionInput
                  value={values.stopPrice}
                  placeholder="하락 금액"
                  unit="원"
                  onChange={(v) => handleChange("stopPrice", v)}
                />
                {String(values.stopPrice).trim() !== "" && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleChange("stopPrice", "")}
                  >
                    <ConditionMinus width={18} height={18} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.rowContainer}>
                <Text style={[styles.compareBadge, styles.minusBadge]}>-</Text>
                <ConditionInput
                  value={values.stopPercent}
                  placeholder="하락 비율"
                  unit="%"
                  onChange={(v) => handleChange("stopPercent", v)}
                />
                {String(values.stopPercent).trim() !== "" && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleChange("stopPercent", "")}
                  >
                    <ConditionMinus width={18} height={18} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />

        {/* 추적 매수 */}
        <ConditionSection
          title="추적 매수 (상승)"
          description="최근 고가 대비 일정 상승 금액 또는 비율 시 알림"
          value={true}
          onAdd={() => {}}
          onToggle={() => {}}
          rows={[{ id: 1 }]}
          hasFilled={
            String(values.buyPrice).trim() !== "" ||
            String(values.buyPercent).trim() !== ""
          }
          renderRow={() => (
            <View>
              <View style={styles.rowContainer}>
                <Text style={[styles.compareBadge, styles.plusBadge]}>+</Text>
                <ConditionInput
                  value={values.buyPrice}
                  placeholder="상승 금액"
                  unit="원"
                  onChange={(v) => handleChange("buyPrice", v)}
                />
                {String(values.buyPrice).trim() !== "" && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleChange("buyPrice", "")}
                  >
                    <ConditionMinus width={18} height={18} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.rowContainer}>
                <Text style={[styles.compareBadge, styles.plusBadge]}>+</Text>
                <ConditionInput
                  value={values.buyPercent}
                  placeholder="상승 비율"
                  unit="%"
                  onChange={(v) => handleChange("buyPercent", v)}
                />
                {String(values.buyPercent).trim() !== "" && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleChange("buyPercent", "")}
                  >
                    <ConditionMinus width={18} height={18} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
        </View>
      </ScrollView>

      {/* 하단 버튼 - 고정 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
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
    marginBottom: 12,
  },
  compareBadge: {
    marginLeft: 0,
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Pretendard",
  },
  plusBadge: {
    color: "#4CC439",
    borderColor: "#4CC439",
    backgroundColor: "#F0FDF4",
  },
  minusBadge: {
    color: "#FF3B30",
    borderColor: "#FF3B30",
    backgroundColor: "#FEF2F2",
  },
  removeButton: { 
    marginLeft: 10,
    padding: 4,
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
