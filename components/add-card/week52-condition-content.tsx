import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ConditionMinus from "../../assets/images/condition-minus.svg";
import ConditionPlus from "../../assets/images/condition-plus.svg";
import Week52HighLowRow from "./week52-highlow-row";

export default function Week52ConditionContent({ onConfirm }: any) {
  const [highLow, setHighLow] = useState<{
    type: "최고가" | "최저가";
    checked: boolean;
  }>({ type: "최고가", checked: false });

  const [rows, setRows] = useState([{ id: 1, sign: "+", value: "" }]);

  const addRow = () =>
    setRows((prev) => [...prev, { id: Date.now(), sign: "+", value: "" }]);
  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const toggleSign = (id: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, sign: r.sign === "+" ? "-" : "+" } : r
      )
    );

  const handleConfirm = () => {
    onConfirm({
      ...highLow,
      proximity: highLow.checked ? rows : [],
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>최근 52주 기준 최고가 | 최저가 여부</Text>

        <Week52HighLowRow onValueChange={(data) => setHighLow(data)} />

        {highLow.checked && (
          <View style={styles.innerSection}>
            <Text style={styles.subTitle}>근접 비율 설정</Text>

            {rows.map((r) => (
              <View key={r.id} style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.signButton,
                    r.sign === "+" ? styles.plusBorder : styles.minusBorder,
                  ]}
                  onPress={() => toggleSign(r.id)}
                >
                  <Text
                    style={[
                      styles.signText,
                      r.sign === "+" ? styles.plusText : styles.minusText,
                    ]}
                  >
                    {r.sign}
                  </Text>
                </TouchableOpacity>

                <View style={styles.inputBox}>
                  <Text style={styles.placeholder}>근접비율 (%)</Text>
                </View>

                {rows.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeRow(r.id)}
                  >
                    <ConditionMinus width={18} height={18} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addRow}>
              <ConditionPlus width={20} height={20} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.reset}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirm} onPress={handleConfirm}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  subTitle: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  innerSection: { marginTop: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  signButton: {
    width: 34,
    height: 34,
    borderWidth: 1.3,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  plusBorder: { borderColor: "#4CC439" },
  minusBorder: { borderColor: "#FF3B30" },
  signText: { fontSize: 16, fontWeight: "700" },
  plusText: { color: "#4CC439" },
  minusText: { color: "#FF3B30" },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  placeholder: { color: "#A4A4A4", fontSize: 13 },
  addButton: {
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  removeButton: { marginLeft: 8 },
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
