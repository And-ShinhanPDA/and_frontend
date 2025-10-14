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
        toggles.avgRise && avgRiseValue.trim() !== "" ? avgRiseValue : null,
      avgDrop:
        toggles.avgDrop && avgDropValue.trim() !== "" ? avgDropValue : null,
      spike: toggles.spike,
      drop: toggles.drop,
    });
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>거래량</Text>

        {/* 평균 거래량 대비 상승 */}
        <ConditionSection
          title="평균 거래량 대비 상승"
          description={VOLUME_SECTION_DESCRIPTIONS.AVG_CHANGE}
          value={toggles.avgRise}
          onToggle={() => toggle("avgRise")}
          rows={[{}]}
          hasFilled={avgRiseValue.trim() !== ""}
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
          hasFilled={avgDropValue.trim() !== ""}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  unit: { marginLeft: 6, fontSize: 13, color: "#555" },
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
