import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ConditionPlus from "../../assets/images/condition-plus.svg";
import SMATargetRow from "./sma-target-row";

type Period = "5일" | "10일" | "20일" | "30일" | "50일" | "100일" | "200일";

export default function SMAConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  type Row = { id: number; filled: boolean; value: string; period: Period };

  const [rows, setRows] = useState<Row[]>([
    { id: 1, filled: false, value: "", period: "5일" },
  ]);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), filled: false, value: "", period: "5일" },
    ]);

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: number, data: { value: string; period: Period }) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              value: data.value,
              period: data.period,
              filled: data.value.trim() !== "",
            }
          : r
      )
    );

  const resetRow = (id: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, value: "", period: "5일", filled: false } : r
      )
    );

  const hasFilled = rows.some((r) => r.filled);

  const handleConfirm = () => {
    const targets = rows
      .filter((r) => r.filled)
      .map((r) => ({ value: r.value, period: r.period }));
    onConfirm({ targets });
  };

  const handleResetAll = () => {
    setRows([{ id: 1, filled: false, value: "", period: "5일" }]);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SMA 목표 가격 도달 여부 알림</Text>
        {rows.map((r) => (
          <SMATargetRow
            key={r.id}
            value={r.value}
            period={r.period}
            onRemove={() => removeRow(r.id)}
            onReset={() => resetRow(r.id)}
            onValueChange={(data) => updateRow(r.id, data)}
            isSingleRow={rows.length === 1}
          />
        ))}
        {hasFilled && (
          <TouchableOpacity style={styles.addButton} onPress={addRow}>
            <ConditionPlus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.reset} onPress={handleResetAll}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10 },
  section: { marginBottom: 20, position: "relative", zIndex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  addButton: { alignItems: "center", justifyContent: "center", marginTop: 6 },
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
