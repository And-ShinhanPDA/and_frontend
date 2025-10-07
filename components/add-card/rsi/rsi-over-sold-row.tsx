import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";
import ConditionPlus from "../../../assets/images/condition-plus.svg";

export default function RSIOverboughtOversoldRow({
  id,
  type,
  onToggle,
  onRemove,
  onAdd,
}: {
  id: number;
  type?: "과매수" | "과매도"; // undefined이면 아직 선택 안 된 상태
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onAdd: () => void;
}) {
  if (!type) {
    return (
      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <ConditionPlus width={20} height={20} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          type === "과매수" ? styles.overbought : styles.oversold,
        ]}
        onPress={() => onToggle(id)}
      >
        <Text
          style={[
            styles.toggleText,
            type === "과매수" ? styles.overboughtText : styles.oversoldText,
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(id)}
      >
        <ConditionMinus width={18} height={18} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleButton: {
    borderWidth: 1.2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  overbought: { borderColor: "#4CC439" },
  oversold: { borderColor: "#FF3B30" },
  toggleText: { fontSize: 13, fontWeight: "600" },
  overboughtText: { color: "#4CC439" },
  oversoldText: { color: "#FF3B30" },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  removeButton: { marginLeft: 8 },
});
