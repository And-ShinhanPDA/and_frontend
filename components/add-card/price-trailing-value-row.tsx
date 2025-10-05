import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConditionMinus from "../../assets/images/condition-minus.svg";

export default function PriceTrailingValueRow({
  onRemove,
  onReset,
  onValueChange,
  isSingleRow,
}: {
  onRemove: () => void;
  onReset: () => void;
  onValueChange: (data: { sign: "+" | "-"; value: string }) => void;

  isSingleRow: boolean;
}) {
  const [sign, setSign] = useState<"+" | "-">("+");
  const [value, setValue] = useState("");

  useEffect(() => {
    onValueChange({ sign, value });
  }, [sign, value]);

  const handleRemove = () => {
    if (isSingleRow) {
      setSign("+");
      setValue("");
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
        <Text
          style={[styles.signText, sign === "+" ? styles.plus : styles.minus]}
        >
          {sign}
        </Text>
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithUnit}
          placeholder="금액을 입력해주세요"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
          placeholderTextColor="#A4A4A4"
        />
        <Text style={styles.unitInside}>원</Text>
      </View>

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
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  signText: {
    fontSize: 18,
    fontWeight: "700",
  },
  plus: { color: "#4CC439" },
  minus: { color: "#FF3B30" },
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
    transform: [{ translateY: -10.5 }],
    fontSize: 13,
    color: "#555",
  },
  removeButton: {
    marginLeft: 8,
  },
});
