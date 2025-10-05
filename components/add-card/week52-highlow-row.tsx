import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Week52HighLowRow({
  onValueChange,
}: {
  onValueChange: (data: {
    type: "최고가" | "최저가";
    checked: boolean;
  }) => void;
}) {
  const [type, setType] = useState<"최고가" | "최저가">("최고가");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    onValueChange({ type, checked });
  }, [type, checked]);

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          type === "최고가" ? styles.highActive : styles.lowActive,
        ]}
        onPress={() => setType(type === "최고가" ? "최저가" : "최고가")}
      >
        <Text
          style={[
            styles.toggleText,
            type === "최고가" ? styles.highText : styles.lowText,
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.checkbox,
          checked && { backgroundColor: "#4CC439", borderColor: "#4CC439" },
        ]}
        onPress={() => setChecked((prev) => !prev)}
      >
        {checked && <Text style={styles.checkMark}>✓</Text>}
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
    flex: 1,
    borderWidth: 1.3,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  highActive: { borderColor: "#4CC439" },
  lowActive: { borderColor: "#FF3B30" },
  toggleText: { fontSize: 15, fontWeight: "600" },
  highText: { color: "#4CC439" },
  lowText: { color: "#FF3B30" },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: "#D9D9D9",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  checkMark: { color: "white", fontWeight: "700", fontSize: 14 },
});
