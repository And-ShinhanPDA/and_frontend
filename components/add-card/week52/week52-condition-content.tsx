import React, { useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ConditionSection from "@/components/condition/condition-section";
import { WEEK52_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import useConditionRows from "@/hooks/use-condition-rows";
import Week52HighProximityRow from "./week52-high-proximity-row";
import Week52LowProximityRow from "./week52-low-proximity-row";
export default function Week52ConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const [sectionToggles, setSectionToggles] = useState({
    highAlert: false,
    highProximity: false,
    lowAlert: false,
    lowProximity: false,
  });

  const toggleSection = (key: keyof typeof sectionToggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSectionToggles((prev) => {
      const newVal = !prev[key];
      if (!newVal) resetSectionState(key);
      return { ...prev, [key]: newVal };
    });
  };

  const resetSectionState = (key: keyof typeof sectionToggles) => {
    switch (key) {
      case "highProximity":
        highProximityRows.resetRow();
        break;
      case "lowProximity":
        lowProximityRows.resetRow();
        break;
    }
  };
  const handleConfirmPress = () => {
    onConfirm({
      highAlert: sectionToggles.highAlert,
      lowAlert: sectionToggles.lowAlert,
      highProximity: sectionToggles.highProximity
        ? highProximityRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              value: r.value,
            }))
        : [],
      lowProximity: sectionToggles.lowProximity
        ? lowProximityRows.rows
            .filter((r) => r.filled)
            .map((r) => ({
              value: r.value,
            }))
        : [],
    });
  };

  // 최고가 근접 상태관리
  const highProximityRows = useConditionRows<
    { id: number; filled: boolean; value: string },
    { value: string }
  >({
    initial: { filled: false, value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      value: data.value,
    }),
  });

  // 최저가 근접 상태관리
  const lowProximityRows = useConditionRows<
    { id: number; filled: boolean; value: string },
    { value: string }
  >({
    initial: { filled: false, value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      value: data.value,
    }),
  });
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
          rows={highProximityRows.rows}
          hasFilled={highProximityRows.hasFilled}
          onAdd={highProximityRows.addRow}
          renderRow={(r) => (
            <Week52HighProximityRow
              key={r.id}
              onRemove={() => highProximityRows.removeRow(r.id)}
              onReset={() => highProximityRows.resetRow(r.id)}
              onValueChange={(data) => highProximityRows.updateRow(r.id, data)}
              isSingleRow={highProximityRows.rows.length === 1}
            />
          )}
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
          rows={lowProximityRows.rows}
          hasFilled={lowProximityRows.hasFilled}
          onAdd={lowProximityRows.addRow}
          renderRow={(r) => (
            <Week52LowProximityRow
              key={r.id}
              onRemove={() => lowProximityRows.removeRow(r.id)}
              onReset={() => lowProximityRows.resetRow(r.id)}
              onValueChange={(data) => lowProximityRows.updateRow(r.id, data)}
              isSingleRow={lowProximityRows.rows.length === 1}
            />
          )}
        />
      </View>

      <View style={styles.footerFixed}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            Object.keys(sectionToggles).forEach((k) =>
              resetSectionState(k as keyof typeof sectionToggles)
            );
            setSectionToggles({
              highAlert: false,
              highProximity: false,
              lowAlert: false,
              lowProximity: false,
            });
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
