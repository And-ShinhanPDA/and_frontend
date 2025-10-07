import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function VolumeSpikeRow({
  type,
  onToggle,
  onRemove,
}: {
  type: "급증" | "감소";
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, type === "급증" ? styles.up : styles.down]}
        onPress={onToggle}
      >
        <Text
          style={[
            styles.toggleText,
            type === "급증" ? styles.upText : styles.downText,
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
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
  up: { borderColor: "#4CC439" },
  down: { borderColor: "#FF3B30" },
  toggleText: { fontSize: 13, fontWeight: "600" },
  upText: { color: "#4CC439" },
  downText: { color: "#FF3B30" },
  removeButton: { marginLeft: 8 },
});
