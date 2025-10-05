import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionMinus from "../../assets/images/condition-minus.svg";

export default function PriceTrailingRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (hasValue: boolean) => void;
  isSingleRow: boolean;
}) {
  const [trailingValue, setTrailingValue] = useState("");
  const [sign, setSign] = useState<"+" | "-">("+");

  useEffect(() => {
    onValueChange(trailingValue.trim() !== "");
  }, [trailingValue]);

  const handleRemove = () => {
    if (isSingleRow) {
      setTrailingValue("");
      setSign("+");
      onReset();
    } else {
      onRemove();
    }
  };

  const toggleSign = () => {
    setSign((prev) => (prev === "+" ? "-" : "+"));
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity style={styles.signButton} onPress={toggleSign}>
        <Text style={styles.signText}>{sign}</Text>
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          value={trailingValue}
          onChangeText={setTrailingValue}
          placeholder="변동률을 입력해주세요"
          keyboardType="numeric"
        />
        <Text style={styles.unitInside}>%</Text>
      </View>

      {trailingValue.trim() !== "" && (
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
  removeButton: { marginLeft: 8 },
});
