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
import ConditionPlus from "../../../assets/images/condition-plus.svg";
import BollingerBandSignalRow from "./bollingerband-singal-row";

export default function BollingerBandConditionContent({
  onConfirm,
}: {
  onConfirm: (data: any) => void;
}) {
  const [rows, setRows] = useState<{ id: number; type?: "강세" | "하락" }[]>(
    []
  );

  const addRow = () =>
    setRows((prev) => [...prev, { id: Date.now(), type: "강세" }]);

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const toggleRowType = (id: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, type: r.type === "강세" ? "하락" : "강세" } : r
      )
    );

  const handleConfirm = () => {
    const signals = rows.filter((r) => r.type).map((r) => ({ type: r.type }));
    onConfirm({ signals });
  };

  const handleReset = () => setRows([]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        extraScrollHeight={80}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>볼린저 밴드</Text>
          <Text style={styles.subText}>볼린저 밴드 강세 | 하락 경고</Text>
          <Text style={styles.help}>
            강세 (상단 SMA(20, 2) ≤ 현재가){"\n"}하락 (하단 SMA(20, 2) ≥ 현재가)
          </Text>

          {rows.map((r) => (
            <BollingerBandSignalRow
              key={r.id}
              id={r.id}
              type={r.type}
              onToggle={toggleRowType}
              onRemove={removeRow}
            />
          ))}

          {rows.length < 2 && (
            <TouchableOpacity style={styles.addButton} onPress={addRow}>
              <ConditionPlus width={20} height={20} />
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
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
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  subText: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  help: { fontSize: 12, color: "#777", lineHeight: 18, marginBottom: 10 },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },
  resetText: { fontSize: 15, color: "#333", fontWeight: "500" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CC439",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmText: { fontSize: 15, color: "#fff", fontWeight: "600" },
});
