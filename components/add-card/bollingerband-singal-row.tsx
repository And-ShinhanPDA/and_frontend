import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConditionMinus from "../../assets/images/condition-minus.svg";

export default function BollingerBandSignalRow({
  id,
  type,
  onToggle,
  onRemove,
}: {
  id: number;
  type?: "강세" | "하락";
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  if (!type) return null;

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          type === "강세" ? styles.bullish : styles.bearish,
        ]}
        onPress={() => onToggle(id)}
      >
        <Text
          style={[
            styles.toggleText,
            type === "강세" ? styles.bullishText : styles.bearishText,
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
  bullish: { borderColor: "#4CC439" },
  bearish: { borderColor: "#FF3B30" },
  toggleText: { fontSize: 13, fontWeight: "600" },
  bullishText: { color: "#4CC439" },
  bearishText: { color: "#FF3B30" },
  removeButton: { marginLeft: 8 },
});
