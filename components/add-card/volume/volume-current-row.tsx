import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionMinus from "../../../assets/images/condition-minus.svg";

export default function VolumeCurrentRow({
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
    compare: "이상" | "이하";
  }) => void;
  isSingleRow: boolean;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [compare, setCompare] = useState<"이상" | "이하">("이상");
  const [value, setValue] = useState("");

  useEffect(() => {
    onValueChange({ sign, value, compare });
  }, [sign, value, compare]);

  const toggleSign = () => {
    setSign((prev) => (prev === "+" ? "-" : "+"));
  };

  const toggleCompare = () => {
    setCompare((prev) => (prev === "이상" ? "이하" : "이상"));
  };

  const handleRemove = () => {
    if (isSingleRow) {
      setValue("");
      setSign("+");
      setCompare("이상");
      onReset();
    } else {
      onRemove();
    }
  };

  return (
    <View style={styles.rowContainer}>
      {value.trim() !== "" && (
        <TouchableOpacity style={styles.signButton} onPress={toggleSign}>
          <Text style={styles.signText}>{sign}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          value={value}
          onChangeText={setValue}
          placeholder="비율 입력"
          keyboardType="numeric"
        />
        <Text style={styles.unitInside}>%</Text>
      </View>

      <TouchableOpacity style={styles.dropdownButton} onPress={toggleCompare}>
        <Text style={styles.dropdownText}>{compare}</Text>
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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
    minWidth: 60,
  },
  dropdownText: { fontSize: 13, color: "#333", textAlign: "center" },
  removeButton: { marginLeft: 8 },
});
