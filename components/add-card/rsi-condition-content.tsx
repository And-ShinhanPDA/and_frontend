import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ConditionPlus from "../../assets/images/condition-plus.svg";
import RSIOverboughtOversoldRow from "./rsi-over-sold-row";
import RSITargetRow from "./rsi-target-row";

export default function RSIConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  // RSI 목표 지수 도달시 경고 State 관리
  const [targetRows, setTargetRows] = useState<
    {
      id: number;
      filled: boolean;
      value: string;
      comparison: "이상" | "이하";
    }[]
  >([{ id: 1, filled: false, value: "", comparison: "이상" }]);

  const addTargetRow = () =>
    setTargetRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, value: "", comparison: "이상" },
    ]);

  const removeTargetRow = (id: number) =>
    setTargetRows((prev) => prev.filter((r) => r.id !== id));

  const updateTargetValue = (
    id: number,
    data: { value: string; comparison: "이상" | "이하" }
  ) => {
    setTargetRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              filled: data.value.trim() !== "",
              value: data.value,
              comparison: data.comparison,
            }
          : r
      )
    );
  };

  const resetTargetRow = (id: number) =>
    setTargetRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, filled: false, value: "", comparison: "이상" } : r
      )
    );

  const hasTargetFilled = targetRows.some((r) => r.filled);

  // RSI 과매수, 과매도 여부 State 관리
  const [stateRows, setStateRows] = useState<
    { id: number; type?: "과매수" | "과매도" }[]
  >([]);

  const addStateRow = () =>
    setStateRows((prev) => [...prev, { id: Date.now(), type: "과매수" }]);

  const removeStateRow = (id: number) =>
    setStateRows((prev) => prev.filter((r) => r.id !== id));

  const toggleStateRow = (id: number) =>
    setStateRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, type: r.type === "과매수" ? "과매도" : "과매수" }
          : r
      )
    );

  const filledTargets = targetRows.filter((r) => r.filled);
  const filledStates = stateRows.filter((r) => r.type);

  const handleConfirmPress = () => {
    onConfirm({
      rsiTargets: filledTargets.map((r) => ({
        value: r.value,
        comparison: r.comparison,
      })),
      rsiStates: filledStates.map((r) => ({
        state: r.type,
      })),
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>RSI</Text>

          {/* RSI 목표 지수 도달시 경고 */}
          <View style={styles.section}>
            <Text style={styles.label}>RSI 목표 지수 도달시 경고</Text>
            {targetRows.map((r) => (
              <RSITargetRow
                key={r.id}
                onRemove={() => removeTargetRow(r.id)}
                onReset={() => resetTargetRow(r.id)}
                onValueChange={(data) => updateTargetValue(r.id, data)}
                isSingleRow={targetRows.length === 1}
              />
            ))}
            {hasTargetFilled && (
              <TouchableOpacity style={styles.addButton} onPress={addTargetRow}>
                <ConditionPlus width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>

          {/* RSI 과매수 / 과매도 여부 */}
          <View style={styles.section}>
            <Text style={styles.label}>RSI 과매수 | 과매도 여부</Text>
            {stateRows.map((r) => (
              <RSIOverboughtOversoldRow
                key={r.id}
                id={r.id}
                type={r.type}
                onToggle={toggleStateRow}
                onRemove={removeStateRow}
                onAdd={addStateRow}
              />
            ))}
            {stateRows.length < 2 && (
              <TouchableOpacity style={styles.addButton} onPress={addStateRow}>
                <ConditionPlus width={20} height={20} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton}>
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
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  container: { paddingBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  section: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  addButton: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
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
