import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionPlus from "../../assets/images/condition-plus.svg";
import Week52HighLowRow from "./week52-highlow-row";
import Week52ProximityRow from "./week52-proximity-row";

export default function Week52ConditionContent({ onConfirm }: any) {
  // 최고가/최저가 여부 조건 선택
  const [highLowRows, setHighLowRows] = useState([
    { id: 1, type: "최고가" as "최고가" | "최저가", checked: false },
  ]);

  // 최고/최저 행 추가 (최대 2개)
  const addHighLowRow = () => {
    if (highLowRows.length >= 2) return;
    const nextType = highLowRows[0].type === "최고가" ? "최저가" : "최고가";
    setHighLowRows((prev) => [
      ...prev,
      { id: Date.now(), type: nextType, checked: false },
    ]);
  };

  const removeHighLowRow = (id: number) =>
    setHighLowRows((prev) => prev.filter((r) => r.id !== id));

  const updateHighLowRow = (
    id: number,
    data: { type: "최고가" | "최저가"; checked: boolean }
  ) =>
    setHighLowRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );

  // 최고가/최저가 근접 여부 조건 선택
  const [proximityRows, setProximityRows] = useState<
    { id: number; type: "최고가" | "최저가"; sign: "+" | "-"; value: string }[]
  >([{ id: 1, type: "최고가", sign: "+", value: "" }]);

  const addProximityRow = () =>
    setProximityRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "최고가",
        sign: "+",
        value: "",
      },
    ]);

  const removeProximityRow = (id: number) =>
    setProximityRows((prev) => prev.filter((r) => r.id !== id));

  const resetProximityRow = (id: number) =>
    setProximityRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, type: "최고가", sign: "+", value: "" } : r
      )
    );

  const updateProximityValue = (
    id: number,
    data: { type: "최고가" | "최저가"; sign: "+" | "-"; value: string }
  ) =>
    setProximityRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );

  const hasFilled = proximityRows.some((r) => r.value.trim() !== "");

  const handleConfirm = () => {
    const filteredHighLow = highLowRows.map((r) => ({
      type: r.type,
      checked: r.checked,
    }));

    const filteredProximity = proximityRows
      .filter((r) => r.value.trim() !== "")
      .map((r) => ({
        type: r.type,
        sign: r.sign,
        value: r.value,
      }));

    onConfirm({
      highLow: filteredHighLow,
      proximity: filteredProximity,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 최고가/최저가 여부 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          최근 52주 기준 최고가 | 최저가 여부
        </Text>

        {highLowRows.map((r) => (
          <Week52HighLowRow
            key={r.id}
            onRemove={() => removeHighLowRow(r.id)}
            onAdd={addHighLowRow}
            onChange={(data) => updateHighLowRow(r.id, data)}
            isSingleRow={highLowRows.length === 1}
          />
        ))}

        {highLowRows.length < 2 && (
          <TouchableOpacity style={styles.addButton} onPress={addHighLowRow}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* 최고가/최저가 근접 여부 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          최근 52주 기준 최고가 | 최저가 근접 여부
        </Text>

        {proximityRows.map((r) => (
          <Week52ProximityRow
            key={r.id}
            onRemove={() => removeProximityRow(r.id)}
            onReset={() => resetProximityRow(r.id)}
            onValueChange={(v: {
              sign: "+" | "-";
              value: string;
              target?: string;
            }) =>
              updateProximityValue(r.id, {
                type: (v.target as "최고가" | "최저가") ?? "최고가",
                sign: v.sign,
                value: v.value,
              })
            }
            isSingleRow={proximityRows.length === 1}
          />
        ))}

        {hasFilled && (
          <TouchableOpacity style={styles.addButton} onPress={addProximityRow}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.reset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  footer: { flexDirection: "row", marginTop: 20 },
  reset: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 8,
  },
  resetText: { fontSize: 15, color: "#333" },
  confirm: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
