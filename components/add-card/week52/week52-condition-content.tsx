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
        sectionToggles.highProximity && highProximity.value.trim() !== ""
          ? { value: highProximity.value }
          : null,
      lowProximity:
        sectionToggles.lowProximity && lowProximity.value.trim() !== ""
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
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>52주</Text>

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
          hasFilled={highProximity.value.trim() !== ""}
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
          hasFilled={lowProximity.value.trim() !== ""}
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

      {/* 하단 버튼 */}
      <View style={styles.footerFixed}>
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
  unit: {
    marginLeft: 6,
    fontSize: 13,
    color: "#555",
  },
  footerFixed: {
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
