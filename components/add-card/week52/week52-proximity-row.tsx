import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionMinus from "../../assets/images/condition-minus.svg";

export default function Week52ProximityRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: {
    sign: "+" | "-";
    value: string;
    target?: string;
  }) => void;

  isSingleRow: boolean;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [value, setValue] = useState("");
  const [target, setTarget] = useState<"최고가" | "최저가">("최고가");

  useEffect(() => {
    onValueChange({ sign, value, target });
  }, [sign, value, target]);

  const handleRemove = () => {
    if (isSingleRow) {
      setSign("+");
      setValue("");
      setTarget("최고가");
      onReset();
    } else {
      onRemove();
    }
  };

  const toggleSign = () => {
    setSign((prev) => (prev === "+" ? "-" : "+"));
  };

  const toggleTarget = () => {
    setTarget((prev) => (prev === "최고가" ? "최저가" : "최고가"));
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity style={styles.signButton} onPress={toggleSign}>
        <Text style={styles.signText}>{sign}</Text>
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          value={value}
          onChangeText={setValue}
          placeholder="근접 비율 입력"
          keyboardType="numeric"
        />
        <Text style={styles.unitInside}>%</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.targetToggle,
          target === "최고가" ? styles.highActive : styles.lowActive,
        ]}
        onPress={toggleTarget}
      >
        <Text
          style={[
            styles.targetText,
            target === "최고가" ? styles.highText : styles.lowText,
          ]}
        >
          {target}
        </Text>
      </TouchableOpacity>

      {value.trim() !== "" && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <ConditionMinus width={18} height={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  signButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  signText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inputWrapper: { flex: 1, position: "relative" },
  inputWithUnit: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingRight: 30,
    fontSize: 14,
  },
  unitInside: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -8 }],
    fontSize: 13,
    color: "#555",
  },
  targetToggle: {
    borderWidth: 1.2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  highActive: {
    borderColor: "#4CC439",
  },
  lowActive: {
    borderColor: "#FF3B30",
  },
  targetText: {
    fontSize: 13,
    fontWeight: "600",
  },
  highText: { color: "#4CC439" },
  lowText: { color: "#FF3B30" },
  removeButton: { marginLeft: 8 },
});
