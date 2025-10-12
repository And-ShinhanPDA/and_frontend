import ConditionSection from "@/components/condition/condition-section";
import { VOLUME_SECTION_DESCRIPTIONS } from "@/components/condition/constants";
import useConditionRows from "@/hooks/use-condition-rows";
import React, { useState } from "react";
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VolumeChangeAvgRow from "./volume-change-avg-row";
import VolumeChangePrevRow from "./volume-change-prev-row";
export default function VolumeConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const [toggles, setToggles] = useState({
    prevChange: false,
    avgChange: false,
    spike: false,
    drop: false,
  });

  const toggle = (key: keyof typeof toggles) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  // 전일 거래량 대비
  const prevRows = useConditionRows<
    { id: number; filled: boolean; sign: "+" | "-"; value: string },
    { sign: "+" | "-"; value: string }
  >({
    initial: { filled: false, sign: "+", value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      sign: data.sign,
      value: data.value,
    }),
  });
  // 평균 거래량 대비
  const avgRows = useConditionRows<
    { id: number; filled: boolean; sign: "+" | "-"; value: string },
    { sign: "+" | "-"; value: string }
  >({
    initial: { filled: false, sign: "+", value: "" },
    updateFn: (prev, data) => ({
      ...prev,
      filled: data.value.trim() !== "",
      sign: data.sign,
      value: data.value,
    }),
  });

  const handleConfirmPress = () => {
    onConfirm({
      prevChange: toggles.prevChange
        ? prevRows.rows.filter((r) => r.filled)
        : [],
      avgChange: toggles.avgChange ? avgRows.rows.filter((r) => r.filled) : [],
      spike: toggles.spike,
      drop: toggles.drop,
    });
  };

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>거래량</Text>

        <ConditionSection
          title="전일 거래량 대비"
          description={VOLUME_SECTION_DESCRIPTIONS.PREV_CHANGE}
          value={toggles.prevChange}
          onToggle={() => toggle("prevChange")}
          rows={prevRows.rows}
          hasFilled={prevRows.hasFilled}
          onAdd={prevRows.addRow}
          renderRow={(r) => (
            <VolumeChangePrevRow
              key={r.id}
              onRemove={() => prevRows.removeRow(r.id)}
              onReset={() => prevRows.resetRow(r.id)}
              onValueChange={(data) => prevRows.updateRow(r.id, data)}
              isSingleRow={prevRows.rows.length === 1}
            />
          )}
        />

        <ConditionSection
          title="평균 거래량 대비"
          description={VOLUME_SECTION_DESCRIPTIONS.AVG_CHANGE}
          value={toggles.avgChange}
          onToggle={() => toggle("avgChange")}
          rows={avgRows.rows}
          hasFilled={avgRows.hasFilled}
          onAdd={avgRows.addRow}
          renderRow={(r) => (
            <VolumeChangeAvgRow
              key={r.id}
              onRemove={() => avgRows.removeRow(r.id)}
              onReset={() => avgRows.resetRow(r.id)}
              onValueChange={(data) => avgRows.updateRow(r.id, data)}
              isSingleRow={avgRows.rows.length === 1}
            />
          )}
        />

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
          onPress={() =>
            setToggles({
              prevChange: false,
              avgChange: false,
              spike: false,
              drop: false,
            })
          }
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
