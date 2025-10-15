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
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>후행 조건 (Trailing)</Text>

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

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  compareBadge: {
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.3,
    fontSize: 13,
    fontWeight: "600",
  },
  plusBadge: {
    color: "#4CC439",
    borderColor: "#4CC439",
  },
  minusBadge: {
    color: "#FF3B30",
    borderColor: "#FF3B30",
  },
  removeButton: { marginLeft: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    marginTop: 10,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginRight: 8,
  },
  resetText: { fontSize: 15, color: "#333", fontWeight: "500" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: { fontSize: 15, color: "#fff", fontWeight: "600" },
});
